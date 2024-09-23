import { Router } from "express";
import db from "../utils/db";
import { ActivityType } from "@prisma/client";

const router = Router();

router.post("/update", async (req, res) => {
  const { userid, activityType, activityPosition } = req.body;

  try {
    const existingUserActivity = await db.userActivity.findFirst({
      where: {
        userId: userid,
      },
    });

    if (existingUserActivity) {
      let activityVector = existingUserActivity.activity;
      activityVector[activityPosition] = activityType;

      const updatedUserActivity = await db.userActivity.update({
        where: {
          id: existingUserActivity.id,
        },
        data: {
          activity: activityVector,
        },
      });

      res.status(200).json(updatedUserActivity);
    } else {
      let activityVector = Array(15).fill("NO_ACTIVITY");
      activityVector[activityPosition] = activityType;

      const newUserActivity = await db.userActivity.create({
        data: {
          userId: userid,
          activity: activityVector,
        },
      });

      res.status(201).json(newUserActivity);
    }
  } catch (error) {
    console.error("Error updating/creating user activity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/query", async (req, res) => {
  let { count_only, activityType, activityPosition } = req.query;

  if (!activityType || !activityPosition) {
    res.status(400).json({ error: "Activity type and position are required" });
    return;
  }

  activityType = activityType.toString();
  let activityPositionInt = parseInt(activityPosition.toString()) + 1;

  try {
    if (count_only === "true") {
      const userActivityCount = await db.$queryRaw`
        SELECT COUNT(*)::INTEGER as count
        FROM "UserActivity"
        WHERE activity[${activityPositionInt}] = ${activityType}::"ActivityType"
      `;

      res.status(200).json({
        count: (userActivityCount as any)[0].count,
      });
    } else {
      const userActivity = await db.$queryRaw`
        SELECT *
        FROM "UserActivity"
        WHERE activity[${activityPositionInt}] = ${activityType}::"ActivityType"
      `;

      res.status(200).json(userActivity);
    }
  } catch (error) {
    console.error("Error querying user activity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
