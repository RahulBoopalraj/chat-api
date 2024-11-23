import express, { Router } from "express";
import multer from "multer";
import { storageInstance } from "../utils/firebase";

const router: Router = express.Router();

const upload = multer({ 
    storage: multer.memoryStorage()
});

router.post("/", upload.single("image"), async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).send({ error: "File is missing or invalid." });
        }

        const bucket = storageInstance.bucket();

        const file = bucket.file(`files/${req.file.originalname}`);

        const stream = file.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        stream.on("error", (error) => {
            console.error("Error uploading file:", error);
            return res.status(500).send({ error: "Error uploading file." });
        });

        stream.on("finish", async () => {
            try {
                await file.makePublic();
                
                const downloadURL = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

                console.log("File uploaded successfully.");

                return res.send({
                    message: "File uploaded successfully",
                    name: req.file?.originalname,
                    type: req.file?.mimetype,
                    downloadURL: downloadURL,
                });
            } catch (error) {
                console.error("Error making file public:", error);
                return res.status(500).send({ error: "Error making file public." });
            }
        });

        stream.end(req.file.buffer);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ error: "Internal Server Error." });
    }
});

export default router;
