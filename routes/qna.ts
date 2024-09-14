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
  const userQuestion = (req.query.question as string).toLowerCase();

  const matchingQuestion = faq.find(
    (item) => item.question.en.toLowerCase() === userQuestion
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
    res
      .status(404)
      .json({ message: "Sorry, I don't have an answer for that question." });
  }
});

router.get("/search", (req, res) => {
  const searchTerm = (req.query.query as string).toLowerCase();
  const matchingQuestions = faq.filter((item) =>
    item.question.en.toLowerCase().includes(searchTerm)
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
    res.status(404).json({ message: "No matching questions found." });
  }
});

router.get("/questions", (req, res) => {
  const { limit, tags, category } = req.query;

  let filteredQuestions = faq;

  if (category) {
    filteredQuestions = filteredQuestions.filter(
      (item) =>
        item.category.toLowerCase() === (category as string).toLowerCase()
    );
  }

  if (tags) {
    const tagArray = (tags as string)
      .split(",")
      .map((tag) => tag.trim().toLowerCase());
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
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      res.status(200).json(result.slice(0, parsedLimit));
    } else {
      res.status(400).json({ message: "Invalid limit parameter" });
    }
  } else {
    res.status(200).json(result);
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
