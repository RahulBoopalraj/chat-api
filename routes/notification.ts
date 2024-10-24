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

  try {
    const notification = await db.notification.upsert({
      where: {
        userId: userid,
      },
      update: {
        status: notificationStatus,
        additional_message: additionalMessage,
      },
      create: {
        userId: userid,
        status: notificationStatus,
        additional_message: additionalMessage,
      },
    });

    res.status(201).json({
      message: "User Notification Status Updated Successfully",
      data: notification,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to update user notification status",
    })
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

  try {
    const notifications = await db.notification.findMany({
      where: {
        status: {
          in: statuses,
        }
      },
      take: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined,
    })

    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({
      error: "server side error: could not access the database",
    })
  }
});

export default router;
