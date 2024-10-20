import { Router } from "express";
import db from "../utils/db";

const router = Router();

router.get("/", (req, res) => {
  res.redirect("/admin/qna?page=1&search=");
});

router.get("/qna", async (req, res) => {
  let { page = 1, search } = req.query;
  const limit = 10;

  page = parseInt(page as string);

  const skip = ((page as number) - 1) * limit;

  try {
    let questions;
    let totalCount;
    let whereCondition = {};

    if (search && typeof search === "string") {
      whereCondition = {
        question: {
          en: {
            contains: search.toLowerCase(),
          },
        },
      };
    }

    [questions, totalCount] = await Promise.all([
      db.qnA.findMany({
        where: whereCondition,
        take: limit,
        skip: skip,
      }),
      db.qnA.count({ where: whereCondition }),
    ]);

    const lastPage = Math.ceil(totalCount / limit);

    const previousExist = (page as number) > 1;
    const nextExist = (page as number) < (lastPage as number);

    const previousLink = previousExist
      ? `/admin?page=${(page as number) - 1}&search=${search || ""}`
      : "";
    const nextLink = nextExist
      ? `/admin?page=${(page as number) + 1}&search=${search || ""}`
      : "";

    res.render("adminqna", {
      questions,
      search: search || "",
      page: page as number,
      previousLink,
      nextLink,
      previousExist,
      nextExist,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).send("Internal server error");
  }
});

router
  .route("/qna/add")
  .get(async (req, res) => {
    res.render("addqna");
  })
  .post(async (req, res) => {
    const {
      question_en,
      answer_en,
      category,
      tags,
      related_questions,
      explanation,
    } = req.body;

    try {
      await db.qnA.create({
        data: {
          question: { en: question_en },
          answer: { en: answer_en },
          category,
          tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : [],
          related_questions: related_questions
            ? related_questions.split(",").map((id: string) => id.trim())
            : [],
          explanation: explanation || null,
        },
      });
      res.redirect("/admin/qna");
    } catch (error) {
      console.error("Error adding QnA:", error);
      res.status(500).send("Internal server error");
    }
  });

router
  .route("/qna/edit/:id")
  .get(async (req, res) => {
    const { id } = req.params;

    try {
      const qna = await db.qnA.findUnique({
        where: { id: id },
      });

      if (!qna) {
        return res.status(404).send("QnA not found");
      }

      res.render("editqna", {
        id: qna.id,
        question: (qna.question as { en: string }).en,
        answer: (qna.answer as { en: string }).en,
        category: qna.category,
        tags: qna.tags.join(", "),
        related_questions: qna.related_questions.join(", "),
        explanation: qna.explanation || "",
      });
    } catch (error) {
      console.error("Error fetching QnA for editing:", error);
      res.status(500).send("Internal server error");
    }
  })
  .post(async (req, res) => {
    const { id } = req.params;
    const {
      question_en,
      answer_en,
      category,
      tags,
      related_questions,
      explanation,
    } = req.body;

    try {
      const updatedQnA = await db.qnA.update({
        where: { id: id },
        data: {
          question: { en: question_en },
          answer: { en: answer_en },
          category,
          tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : [],
          related_questions: related_questions
            ? related_questions.split(",").map((id: string) => id.trim())
            : [],
          explanation: explanation || null,
        },
      });
      res.redirect("/admin/qna");
    } catch (error) {
      console.error("Error updating QnA:", error);
      res.status(500).send("Internal server error");
    }
  });

export default router;
