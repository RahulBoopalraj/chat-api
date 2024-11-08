import { Router } from "express";
import db from "../utils/db";

const router = Router();

router.get("/fetch", async (req, res) => {
    try {
        const notificationContent = await db.notificationContent.findMany();
        res.status(200).json({ data: notificationContent });
    } catch (error) {
        console.error("error fetching notification content", error);
        res.status(500).json({ message: "[Internal server error] could not fetch notification content" });
    }
});

router.post("/update", async (req, res) => {
    const { notificationId, notificationKey, notificationTitle, notificationMessage } = req.body;

    if (!notificationId || typeof notificationId !== "string") {
        return res.status(400).json({ error: "Invalid or missing notificationId" });
    }

    const updateData: any = {};
    if (notificationKey && typeof notificationKey === "string") {
        updateData.key = notificationKey;
    }
    if (notificationTitle && typeof notificationTitle === "string") {
        updateData.title = notificationTitle;
    }
    if (notificationMessage && typeof notificationMessage === "string") {
        updateData.message = notificationMessage;
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
    }

    try {
        const notification = await db.notificationContent.update({
            where: {
                id: notificationId,
            },
            data: updateData,
        });

        res.status(200).json({
            message: "Notification Content Updated Successfully",
            data: notification,
        });
    } catch (error) {
        console.error("error updating notification content", error);
        res.status(500).json({ message: "[Internal server error] could not update notification content" });
    }
});

router.post("/create", async (req, res) => {
    const { notificationKey, notificationTitle, notificationMessage } = req.body;

    if (!notificationKey || typeof notificationKey !== "string") {
        return res.status(400).json({ error: "Invalid or missing notificationKey" });
    }

    if (!notificationTitle || typeof notificationTitle !== "string") {
        return res.status(400).json({ error: "Invalid or missing notificationTitle" });
    }

    if (!notificationMessage || typeof notificationMessage !== "string") {
        return res.status(400).json({ error: "Invalid or missing notificationMesage" });
    }

    try {
        const notification = await db.notificationContent.create({
            data: {
                key: notificationKey,
                title: notificationTitle,
                message: notificationMessage,
            },
        });

        res.status(201).json({
            message: "Notification Content Created Successfully",
            data: notification,
        });
    } catch (error) {
        console.error("error creating notification content", error);
        res.status(500).json({ message: "[Internal server error] could not create notification content" });
    }
});

router.post("/delete", async (req, res) => {
    const { notificationId } = req.body;

    if (!notificationId || typeof notificationId !== "string") {
        return res.status(400).json({ error: "Invalid or missing notificationId" });
    }

    try {
        await db.notificationContent.delete({
            where: {
                id: notificationId,
            },
        });

        res.status(200).json({ message: "Notification Content Deleted Successfully" });
    } catch (error) {
        console.error("error deleting notification content", error);
        res.status(500).json({ message: "[Internal server error] could not delete notification content" });
    }
});

export default router;