import { Router } from "express";
import db from "../utils/db";
import { QnaFlowStatus } from "@prisma/client";

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
    console.error("error getting the flow", error);
    res
      .status(500)
      .json({ message: "[Internal server error] could not get the flow" });
  }
});

router.post("/set-flow", async (req, res) => {
  const { flow } = req.body;

  if(!flow) {
    res.status(400).json({
      message: "Invalid request: flow is required", 
    });
  }

  let parsedFlow;

  try {
    parsedFlow = JSON.parse(flow);
  } catch (error) {
    res.status(400).json({
      message: "Invalid flow value: flow has to be a valid JSON String",
    });
    return
  }


  // get the id of the first flow
  try {
    const firstFlow = await db.qnaFlow.findFirst();

    if (!firstFlow) {
      await db.qnaFlow.create({
        data: {
          flow: parsedFlow,
        },
      });
    } else {
      await db.qnaFlow.update({
        where: {
          id: firstFlow.id,
        },
        data: {
          flow: parsedFlow,
        },
      });
    }

    res.status(200).json({ message: "Flow updated successfully" });
  } catch (error) {
    console.error("error updating the flow", error);
    res
      .status(500)
      .json({ message: "[Internal server error] could not update the flow" });
  }
});

// for users to upload the full conversation with the client
router.post("/upload-conversation", async (req, res) => {
  const { conversation, userId } = req.body;

  if (!conversation || !userId) {
    res.status(400).json({
      message: "Invalid request: conversation and userId are required",
    });
  }

  // checking if the conversation is in the type of string and if it is parsable to JSON
  if (typeof conversation !== "string") {
    res.status(400).json({
      message: "Invalid conversation value: conversation has to be a JSON String",
    });
    return;
  }

  let parsedConversation;

  try {
    parsedConversation = JSON.parse(conversation);
  } catch (error) {
    res.status(400).json({
      message: "Invalid conversation value: conversation has to be a valid JSON String",
    });
    return
  }


  try {
    await db.qnaFlowResponse.create({
      data: {
        userid: userId,
        response: parsedConversation,
        status: QnaFlowStatus.NEW,
      },
    });

    res.status(200).json({ message: "Conversation uploaded successfully" });
  } catch (error) {
    console.error("error uploading the conversation", error);
    res.status(500).json({
      message: "[Internal server error] could not upload the conversation",
    });
  }
});

// for admins to get the conversations
router.get("/get-conversations", async (req, res) => {
  const { status, skip, limit } = req.query;

  // checking if status is in the type of qnaFlowStatus
  if (
    status &&
    !Object.values(QnaFlowStatus).includes(status as QnaFlowStatus)
  ) {
    res.status(400).json({
      message:
        "Invalid status value: status has to be one of the predefined values",
    });
    return;
  }

  // checking if skip and limit are numbers
  if (skip && isNaN(parseInt(skip as string))) {
    res
      .status(400)
      .json({ message: "Invalid skip value: skip has to be numeric" });
    return;
  }

  if (limit && isNaN(parseInt(limit as string))) {
    res
      .status(400)
      .json({ message: "Invalid limit value: limit has to be numeric" });
    return;
  }

  try {
    const conversations = await db.qnaFlowResponse.findMany({
      where: {
        status: status ? (status as QnaFlowStatus) : undefined,
      },
      skip: skip ? parseInt(skip as string) : undefined,
      take: limit ? parseInt(limit as string) : undefined,
    });

    res.status(200).json({ data: conversations });
  } catch (error) {
    console.error("error getting the conversation", error);
    res.status(500).json({
      message: "[Internal server error] could not get the conversation",
    });
  }
});

// for admins to update the status and notes assigned to a conversation
router.post("/update-conversation", async (req, res) => {
  const { conversationId, status, notes } = req.body;


  // checking if status is in the type of qnaFlowStatus
  if (
    status &&
    !Object.values(QnaFlowStatus).includes(status as QnaFlowStatus)
  ) {
    res.status(400).json({
      message:
        "Invalid status value: status has to be one of the predefined values",
    });
    return;
  }

  try {
    await db.qnaFlowResponse.update({
      where: {
        id: conversationId,
      },
      data: status ? { status, notes } : { notes },
    });

    res.status(200).json({ message: "Conversation updated successfully" });
  } catch (error) {
    console.error("error updating the conversation", error);
    res.status(500).json({
      message: "[Internal server error] could not update the conversation",
    });
  }
});

export default router;
