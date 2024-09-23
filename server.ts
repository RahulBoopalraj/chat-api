import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import qna_router from "./routes/qna";
import notification_router from "./routes/notification";
import user_activity_router from "./routes/user-activity";

const app = express();
const port = 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 8 * 60 * 1000, // 8 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);
app.use(express.json()); // Body parser, reading data from body into req.body
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/qna", qna_router);
app.use("/notification", notification_router);
app.use("/user-activity", user_activity_router);

app.listen(port, () => {
  console.log(`Chatbot API is running on http://localhost:${port}`);
});
