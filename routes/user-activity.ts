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

  const existingUserActivity = await db.userActivity.findFirst({
    where: {
      userId: userid,
    },
  });

  if (existingUserActivity) {
    let activityVector = existingUserActivity.activity;
    activityVector[activityPosition] = activityType;

    const updatedUserActivity = await db.userActivity
      .update({
        where: {
          id: existingUserActivity.id,
        },
        data: {
          activity: activityVector,
        },
      })
      .catch((error) => {
        console.error("Error updating user activity:", error);
        return res
          .status(500)
          .json({ error: "Failed to update user activity" });
      });

    if (updatedUserActivity) {
      res.status(200).json(updatedUserActivity);
    }
  } else {
    let activityVector = Array(15).fill("NO_ACTIVITY");
    activityVector[activityPosition] = activityType;

    const newUserActivity = await db.userActivity
      .create({
        data: {
          userId: userid,
          activity: activityVector,
        },
      })
      .catch((error) => {
        console.error("Error creating user activity:", error);
        return res
          .status(500)
          .json({ error: "Failed to create user activity" });
      });

    if (newUserActivity) {
      res.status(201).json(newUserActivity);
    }
  }
});

router.get("/query", async (req, res) => {
  let { count_only, activityType, activityPosition } = req.query;

  if (!activityType || typeof activityType !== "string") {
    return res.status(400).json({ error: "Invalid or missing activityType" });
  }

  if (!activityPosition || typeof activityPosition !== "string") {
    return res
      .status(400)
      .json({ error: "Invalid or missing activityPosition" });
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
    const userActivityCount = await db.$queryRaw`
      SELECT COUNT(*)::INTEGER as count
      FROM "UserActivity"
      WHERE activity[${activityPositionInt}] = ${activityType}::"ActivityType"
    `.catch((error) => {
      console.error("Error querying user activity count:", error);
      return res
        .status(500)
        .json({ error: "Failed to query user activity count" });
    });

    if (userActivityCount) {
      res.status(200).json({
        count: (userActivityCount as any)[0].count,
      });
    }
  } else {
    const userActivity = await db.$queryRaw`
      SELECT *
      FROM "UserActivity"
      WHERE activity[${activityPositionInt}] = ${activityType}::"ActivityType"
    `.catch((error) => {
      console.error("Error querying user activity:", error);
      return res.status(500).json({ error: "Failed to query user activity" });
    });

    if (userActivity) {
      res.status(200).json(userActivity);
    }
  }
});

export default router;
