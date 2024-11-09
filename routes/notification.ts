import { Router } from "express";
import db from "../utils/db";

const router = Router();

router.post("/update", async (req, res) => {
  const { userid, notificationStatus, additionalMessage } = req.body;

  if (!userid || typeof userid !== "string") {
    return res.status(400).json({ error: "Invalid or missing userid" });
  }

  if (
    !notificationStatus || typeof notificationStatus !== "string"
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
    const notificationStatusRecord = await db.notificationContent.findFirst({
      where: {
        key: notificationStatus,
      },
    });

    if (!notificationStatusRecord) {
      return res.status(400).json({
        error: "Invalid notification status provided",
      });
    }

    const notification = await db.notification.upsert({
      where: {
        userId: userid,
      },
      update: {
        // status: notificationStatus,
        additional_message: additionalMessage,
        status: { connect: { id: notificationStatusRecord.id } },
      },
      create: {
        userId: userid,
        additional_message: additionalMessage,
        status: { connect: { id: notificationStatusRecord.id } },
      },
      include: {
        status: true,
      }
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

  if (status && typeof status !== "string") {
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

    let notificationRecord: { id: string } | null = null;

    if (status) {
      notificationRecord = await db.notificationContent.findFirst({
        where: {
          key: status,
        },
      });

      if (!notificationRecord) {
        return res.status(400).json({
          error: "Invalid status value provided",
        });
      }
    }

    const notifications = await db.notification.findMany({
      where: status
        ? {
          status: { id: notificationRecord!.id },
        }
        : {},
      take: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined,
      include: {
        status: true,
      }
    });

    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({
      error: "server side error: could not access the database",
    });
  }
});

export default router;
