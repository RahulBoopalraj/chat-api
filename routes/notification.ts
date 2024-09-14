import { Router } from "express";
import db from "../utils/db";
import { NotificationStatus } from "@prisma/client";

const router = Router();

router.post("/update", async (req, res) => {
  const { userid, notificationStatus, additionalMessage } = req.body;

  try {
    const existingNotification = await db.notification.findFirst({
      where: {
        userId: userid,
      },
    });

    if (existingNotification) {
      // Update existing notification
      const updatedNotification = await db.notification.update({
        where: {
          id: existingNotification.id,
        },
        data: {
          status: notificationStatus,
          additional_message: additionalMessage,
        },
      });
      res.status(200).json(updatedNotification);
    } else {
      // Create new notification
      const newNotification = await db.notification.create({
        data: {
          userId: userid,
          status: notificationStatus,
          additional_message: additionalMessage,
        },
      });
      res.status(201).json(newNotification);
    }
  } catch (error) {
    console.error("Error updating/creating notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/query", async (req, res) => {
  const { status, limit, skip } = req.query;

  if (!status || typeof status !== "string") {
    res.status(400).json({ error: "Status is required and must be a string" });
    return;
  }

  try {
    const statuses = status.includes(",")
      ? status
          .toString()
          .split(",")
          .map((s) => s.trim() as NotificationStatus)
      : [status.trim() as NotificationStatus];

    const notifications = await db.notification.findMany({
      where: {
        status: {
          in: statuses,
        },
      },
      take: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined,
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error querying notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
