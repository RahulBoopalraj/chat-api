const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");

const app = express();
const port = 3000;

// Security middleware
app.use(helmet()); // Helps secure Express apps with various HTTP headers
app.use(cors()); // Enable CORS for all routes
app.use(xss()); // Sanitize user input

// Rate limiting
const limiter = rateLimit({
  windowMs: 8 * 60 * 1000, // 8 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(bodyParser.json({ limit: "10kb" })); // Body parser, reading data from body into req.body

const qnaPath = path.join(__dirname, "qna.json");
const faq = JSON.parse(fs.readFileSync(qnaPath, "utf8"));

app.post("/ask", (req, res) => {
  const userQuestion = req.body.question.toLowerCase();

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

app.get("/search", (req, res) => {
  const searchTerm = req.query.query.toLowerCase();
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

app.get("/questions", (req, res) => {
  const { limit, tags, category } = req.query;

  let filteredQuestions = faq;

  if (category) {
    filteredQuestions = filteredQuestions.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (tags) {
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
    const parsedLimit = parseInt(limit);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      res.status(200).json(result.slice(0, parsedLimit));
    } else {
      res.status(400).json({ message: "Invalid limit parameter" });
    }
  } else {
    res.status(200).json(result);
  }
});

app.get("/categories", (req, res) => {
  const categories = faq.map((item) => item.category);
  const uniqueCategories = [...new Set(categories)];
  res.status(200).json(uniqueCategories);
});

app.get("/tags", (req, res) => {
  const tags = faq.flatMap((item) => item.tags);
  const uniqueTags = [...new Set(tags)];
  res.status(200).json(uniqueTags);
});

app.listen(port, () => {
  console.log(`Chatbot API is running on http://localhost:${port}`);
});
