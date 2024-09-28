import { Router } from "express";
import db from "../utils/db";
import { NotificationStatus } from "@prisma/client";

const router = Router();

router.post("/update", async (req, res) => {
  const { userid, notificationStatus, additionalMessage } = req.body;

  if (!userid || typeof userid !== "string") {
    return res.status(400).json({ error: "Invalid or missing userid" });
  }

  if (
    !notificationStatus ||
    !Object.values(NotificationStatus).includes(notificationStatus)
  ) {
    return res
      .status(400)
      .json({ error: "Invalid or missing notificationStatus" });
  }

  if (additionalMessage && typeof additionalMessage !== "string") {
    return res
      .status(400)
      .json({ error: "additionalMessage must be a string" });
  }

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
});

router.get("/query", async (req, res) => {
  const { status, limit, skip } = req.query;

  if (!status || typeof status !== "string") {
    return res
      .status(400)
      .json({ error: "Status is required and must be a string" });
  }

  const statuses = status.includes(",")
    ? status
        .toString()
        .split(",")
        .map((s) => s.trim() as NotificationStatus)
    : [status.trim() as NotificationStatus];

  if (statuses.some((s) => !Object.values(NotificationStatus).includes(s))) {
    return res.status(400).json({ error: "Invalid status value provided" });
  }

  if (limit && (isNaN(Number(limit)) || Number(limit) < 1)) {
    return res.status(400).json({ error: "Limit must be a positive number" });
  }

  if (skip && (isNaN(Number(skip)) || Number(skip) < 0)) {
    return res
      .status(400)
      .json({ error: "Skip must be a non-negative number" });
  }

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
});

export default router;
