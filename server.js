const express = require("express");
const bodyParser = require("body-parser");
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
  windowMs: 8 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(bodyParser.json({ limit: "10kb" })); // Body parser, reading data from body into req.body

const faq = {
  "What is your name?": "I am a chatbot created by Zynex Solutions.",
  "What services do you offer?":
    "We provide web development and digital marketing services.",
  "How can I contact support?":
    "You can contact support via email at support@zynexsolutions.com.",
  "What is the cost of your services?":
    "Our pricing varies depending on the services you need. Contact us for more details.",
  "Where are you located?": "We are located in Chennai, India.",
};

app.post("/ask", (req, res) => {
  const question = req.body.question;

  const answer = faq[question];

  if (answer) {
    res.status(200).json({ question, answer });
  } else {
    res
      .status(404)
      .json({ message: "Sorry, I don't have an answer for that question." });
  }
});

app.listen(port, () => {
  console.log(`Chatbot API is running on http://localhost:${port}`);
});
