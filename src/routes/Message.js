import express from "express";
import ActualMessageInfo from "../../models/MessageSchema.js";
import MessageInfo from "../../models/Conversation.js";
import { authenticate } from "../../utils/middleware.js";

const route = express.Router();

//conversation = combo
route.post("/conversation", async (req, res) => {
  try {
    console.log(req.body);
    const senderId = req.body.senderId;
    const receiverId = req.body.receiverId;

    const existingConversation = await MessageInfo.findOne({
      conversation: { $all: [senderId, receiverId] },
    });

    if (existingConversation) {
      return res.status(200).json({ conversation: existingConversation });
    }
    const conversation = new MessageInfo({
      conversation: [senderId, receiverId],
    });
    await conversation.save();
    res.status(200).json({ conversation });
  } catch (err) {
    console.log(err);
  }
});

//get all conversation which contains my id
route.get("/conversation", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await MessageInfo.find({
      conversation: { $in: [userId] },
    })
      .populate({
        path: "conversation",
        model: "userInformation",
        options: { strictPopulate: false },
        select: "-password -savedPost -isVerified -bio",
      })
      .exec();

    const filteredResult = result.filter((message) => {
      if (message.conversation.some((conv) => conv._id.equals(userId))) {
        message.conversation = message.conversation
          .map((conv) => (conv._id.equals(userId) ? null : conv))
          .filter((conv) => conv !== null);
      }
      return message;
    });

    res.status(200).json({ result: filteredResult });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

// for message
// messages
route.post("/messages", authenticate, async (req, res) => {
  try {
    const senderId = req.user._id;
    const conversationId = req.body.conversationId;
    const msg = req.body.msg;
    console.log(msg)
    const messages = new ActualMessageInfo({
      senderId,
      conversationId,
      msg,
    });
    await messages.save();
    res.status(200).json({ messages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create new message" });
  }
});

//get message of conversation of user
route.get("/messagesCombo/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await ActualMessageInfo.find({ conversationId: id }).exec();
    res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

export default route;
