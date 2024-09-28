import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

type FAQItem = {
  id: string;
  question: {
    en: string;
  };
  answer: {
    en: string;
  };
  category: string;
  tags: string[];
  related_questions?: string[];
  explanation?: string;
};

// Define the type for the entire FAQ array
type FAQ = FAQItem[];

const qnaPath = path.join(__dirname, "..", "qna.json");
const faq: FAQ = JSON.parse(fs.readFileSync(qnaPath, "utf8"));

router.get("/ask", (req, res) => {
  const userQuestion = req.query.question;

  if (!userQuestion || typeof userQuestion !== "string") {
    return res
      .status(400)
      .json({ error: "Question parameter is required and must be a string" });
  }

  const matchingQuestion = faq.find(
    (item) => item.question.en.toLowerCase() === userQuestion.toLowerCase()
  );

  if (matchingQuestion) {
    res.status(200).json({
      question: matchingQuestion.question.en,
      answer: matchingQuestion.answer.en,
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
});

router.get("/search", (req, res) => {
  const searchTerm = req.query.query;

  if (!searchTerm || typeof searchTerm !== "string") {
    return res
      .status(400)
      .json({ error: "Query parameter is required and must be a string" });
  }

  const matchingQuestions = faq.filter((item) =>
    item.question.en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (matchingQuestions.length > 0) {
    const results = matchingQuestions.map((item) => ({
      id: item.id,
      question: item.question.en,
      answer: item.answer.en,
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
});

router.get("/questions", (req, res) => {
  const { limit, tags, category } = req.query;

  let filteredQuestions = faq;

  if (category) {
    if (typeof category !== "string") {
      return res
        .status(400)
        .json({ error: "Category parameter must be a string" });
    }
    filteredQuestions = filteredQuestions.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (tags) {
    if (typeof tags !== "string") {
      return res.status(400).json({ error: "Tags parameter must be a string" });
    }
    const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
    filteredQuestions = filteredQuestions.filter((item) =>
      item.tags.some((tag) => tagArray.includes(tag.toLowerCase()))
    );
  }

  const result = filteredQuestions.map((item) => ({
    id: item.id,
    question: item.question.en,
    category: item.category,
    tags: item.tags,
  }));

  if (limit) {
    const parsedLimit = parseInt(limit as string);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res
        .status(400)
        .json({ error: "Limit parameter must be a positive integer" });
    }
    res.status(200).json(result.slice(0, parsedLimit));
  } else {
    res.status(200).json(result);
  }

  if (result.length === 0) {
    res.status(404).json({
      error:
        "No questions found matching the specified criteria. Try adjusting your category or tags.",
    });
  }
});

router.get("/categories", (req, res) => {
  const categories = faq.map((item) => item.category);
  const uniqueCategories = [...new Set(categories)];
  res.status(200).json(uniqueCategories);
});

router.get("/tags", (req, res) => {
  const tags = faq.flatMap((item) => item.tags);
  const uniqueTags = [...new Set(tags)];
  res.status(200).json(uniqueTags);
});

export default router;
