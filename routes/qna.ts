import { Router } from "express";
import db from "../utils/db";

const router = Router();

router.get("/ask", async (req, res) => {
  const userQuestion = req.query.question;

  if (!userQuestion || typeof userQuestion !== "string") {
    return res
      .status(400)
      .json({ error: "Question parameter is required and must be a string" });
  }

  try {
    const matchingQuestion = await db.qnA.findFirst({
      where: {
        question: {
          equals: { en: userQuestion.toLowerCase() },
        },
      },
    });

    if (matchingQuestion) {
      res.status(200).json({
        question: (matchingQuestion.question as { en: string }).en,
        answer: (matchingQuestion.answer as { en: string }).en,
        category: matchingQuestion.category,
        tags: matchingQuestion.tags,
        related_questions: matchingQuestion.related_questions,
      });
    } else {
      res.status(404).json({
        error:
          "No exact match found for the provided question. Try rephrasing or use the search endpoint for partial matches.",
      });
    }
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/search", async (req, res) => {
  const searchTerm = req.query.query;

  if (!searchTerm || typeof searchTerm !== "string") {
    return res
      .status(400)
      .json({ error: "Query parameter is required and must be a string" });
  }

  try {
    const matchingQuestions = await db.qnA.findMany({
      where: {
        question: {
          $jsonSchema: {
            bsonType: "object",
            required: ["en"],
            properties: {
              en: {
                bsonType: "string",
                description: "must be a string and is required",
              },
            },
          },
          $expr: {
            $regexMatch: {
              input: { $toLower: "$question.en" },
              regex: searchTerm.toLowerCase(),
            },
          },
        },
      },
    });

    if (matchingQuestions.length > 0) {
      const results = matchingQuestions.map((item) => ({
        id: item.id,
        question: (item.question as { en: string }).en,
        answer: (item.answer as { en: string }).en,
        category: item.category,
        tags: item.tags,
        related_questions: item.related_questions,
      }));
      res.status(200).json(results);
    } else {
      res.status(404).json({
        error:
          "No questions found matching the search term. Try using different keywords or check your spelling.",
      });
    }
  } catch (error) {
    console.error("Error searching questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/questions", async (req, res) => {
  const { limit, tags, category } = req.query;

  try {
    let queryConditions: any = {};

    if (category) {
      if (typeof category !== "string") {
        return res
          .status(400)
          .json({ error: "Category parameter must be a string" });
      }
      queryConditions.category = category.toLowerCase();
    }

    if (tags) {
      if (typeof tags !== "string") {
        return res
          .status(400)
          .json({ error: "Tags parameter must be a string" });
      }
      const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
      queryConditions.tags = { hasSome: tagArray };
    }

    const questions = await db.qnA.findMany({
      where: queryConditions,
      take: limit ? parseInt(limit as string) : undefined,
    });

    const result = questions.map((item) => ({
      id: item.id,
      question: (item.question as { en: string }).en,
      category: item.category,
      tags: item.tags,
    }));

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        error:
          "No questions found matching the specified criteria. Try adjusting your category or tags.",
      });
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await db.qnA.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
    });
    const uniqueCategories = categories.map((item) => item.category);
    res.status(200).json(uniqueCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tags", async (req, res) => {
  try {
    const tags = await db.qnA.findMany({
      select: {
        tags: true,
      },
    });
    const uniqueTags = [...new Set(tags.flatMap((item) => item.tags))];
    res.status(200).json(uniqueTags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
