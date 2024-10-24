import { Router } from "express";
import fs from "fs";
import path from "path";
import db from "../utils/db";

const router = Router();

router.get("/flow", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../qna.json");
    const data = fs.readFileSync(filePath, "utf-8");
    const flow = JSON.parse(data);
    res.status(200).json(flow);
  } catch (error) {
    res.status(500).json({ error: "Failed to load chat flow" });
  }
});

router.post("/submit", async (req, res) => {
  try {
    const {
      mobileNumber,
      name,
      serviceType,
      guestCount,
      foodType,
      extraServices,
      eventLocation,
      customService,
      helpRequest,
    } = req.body;

    // Validate required fields
    if (!mobileNumber || !name || !serviceType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create a new QnA entry
    const newQnA = {
      mobileNumber,
      name,
      serviceType,
      guestCount,
      foodType,
      extraServices,
      eventLocation,
      customService,
      helpRequest,
    };

    // Here you would typically save the newQnA to the database
    // For example, using Prisma:
    const savedQnA = await db.qnA.create({
      data: newQnA,
    });

    // Return a success response
    res.status(201).json({ message: "Form submitted successfully", data: savedQnA });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit form" });
  }
});

export default router;
