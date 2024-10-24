import { Router } from "express";
import db from "../utils/db";
import { ActivityType } from "@prisma/client";

const router = Router();

router.post("/update", async (req, res) => {
  const { userid, activityType, activityPosition } = req.body;

  if (!userid || typeof userid !== "string") {
    return res.status(400).json({ error: "Invalid or missing userid" });
  }

  if (!activityType || !Object.values(ActivityType).includes(activityType)) {
    return res.status(400).json({ error: "Invalid or missing activityType" });
  }

  const activityPositionNumber = Number(activityPosition);
  if (
    isNaN(activityPositionNumber) ||
    activityPositionNumber < 0 ||
    activityPositionNumber >= 15
  ) {
    return res.status(400).json({
      error: "Invalid activityPosition. Must be a number between 0 and 14",
    });
  }

  try {
    const result = await db.userActivity.upsert({
      where: {
        userId_activityPosition: {
          userId: userid,
          activityPosition: parseInt(activityPosition)
        }
      },
      create: {
        userId: userid,
        activityPosition: parseInt(activityPosition),
        activity: activityType,
      },

      update: {
        activityPosition: parseInt(activityPosition),
        activity: activityType
      },
    })

    res.status(200).json({
      message: "User Activity Has been updated successfully",
      data: result
    })
  } catch (error) {
    res.status(500).json({
      error: "server side error: Failed to update user activity",
    })
  }
});

router.get("/query", async (req, res) => {
  let { count_only, activityType, activityPosition, skip, limit } = req.query;

  if (!activityType || typeof activityType !== "string") {
    return res.status(400).json({ error: "Invalid or missing activityType" });
  }

  if (!activityPosition || typeof activityPosition !== "string") {
    return res
      .status(400)
      .json({ error: "Invalid or missing activityPosition" });
  }

  if (limit && (isNaN(Number(limit)) || Number(limit) < 1)) {
    return res.status(400).json({ error: "Limit must be a positive number" });
  }

  if (skip && (isNaN(Number(skip)) || Number(skip) < 0)) {
    return res
      .status(400)
      .json({ error: "Skip must be a non-negative number" });
  }

  let activityPositionInt = parseInt(activityPosition);

  if (
    isNaN(activityPositionInt) ||
    activityPositionInt < 0 ||
    activityPositionInt >= 15
  ) {
    return res.status(400).json({
      error: "Invalid activityPosition. Must be a number between 0 and 14",
    });
  }

  activityPositionInt += 1; // Adjusting for array index in SQL

  if (count_only === "true") {
    try {
      const userActivityCount = await db.userActivity.count({
        where: {
          activityPosition: parseInt(activityPosition),
          activity: activityType as ActivityType
        }
      })

      return res.status(200).json({
        data: userActivityCount
      })
    } catch (error) {
      return res.status(500).json({
        error: "Server Side Error: Cannot fetch user activity count"
      })
    }
  } else {
    try {
      const userActivities = await db.userActivity.findMany({
        where: {
          activityPosition: parseInt(activityPosition),
          activity: activityType as ActivityType
        },
        take: limit ? parseInt(limit as string) : undefined,
        skip: skip ? parseInt(skip as string) : undefined,
      })

      return res.status(200).json({
        data: userActivities,
      })
    } catch (error) {
      return res.status(500).json({
        error: "Server Side Error: Cannot fetch the user activity count"
      })
    }
  }
});

export default router;
