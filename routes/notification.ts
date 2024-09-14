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
        id: notificationStatus,
      },
    });

    if (existingNotification) {
      // Update existing notification
      const updatedNotification = await db.notification.update({
        where: {
          id: notificationStatus,
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

  try {
    // Ensure statuses are properly typed as NotificationStatus[]
    const statuses = Array.isArray(status)
      ? (status as string[]).map((s) => s as NotificationStatus)
      : [status as NotificationStatus];

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
