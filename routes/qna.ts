import { Router } from "express";
import db from "../utils/db";

const router = Router();

router.get("/get-flow", async (req, res) => {
  try {
    const flow = await db.qnaFlow.findFirst();

    if (!flow) {
      res.status(404).json({ message: "No flow found" });
    } else {
      res.status(200).json({ data: flow });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "[Internal server error] could not get the flow" });
  }
});

router.post("/set-flow", async (req, res) => {
  const { flow } = req.body;

  // get the id of the first flow
  try {
    const firstFlow = await db.qnaFlow.findFirst();

    if (!firstFlow) {
      await db.qnaFlow.create({
        data: {
          flow,
        },
      });
    } else {
      await db.qnaFlow.update({
        where: {
          id: firstFlow.id,
        },
        data: {
          flow,
        },
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "[Internal server error] could not update the flow" });
  }
});

// for users to get the chat flow

// for users to upload the full conversation with the client

// for admins to get the conversations

// for admins to update the status and notes assigned to a conversation

export default router;
