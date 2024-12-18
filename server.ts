import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import rateLimit from "express-rate-limit";
import qna_router from "./routes/qna";
import notification_router from "./routes/notification";
import user_activity_router from "./routes/user-activity";
import search_router from "./routes/search";
import tags_router from "./routes/tags";
import notification_content_router from "./routes/notificationContent";
import upload_file from "./routes/fileupload"
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));

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
app.use("/fileupload", upload_file)
app.use("/qna", qna_router);
app.use("/notification", notification_router);
app.use("/user-activity", user_activity_router);
app.use("/search", search_router);
app.use("/tags", tags_router);
app.use("/notification-content", notification_content_router);

app.listen(port, () => {
  console.log(`Chatbot API is running on http://localhost:${port}`);
});
