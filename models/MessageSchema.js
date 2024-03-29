import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const Message = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    senderId: {
      type: ObjectId,
      ref: "userInformation",
    },
    msg: {
      type: String,
    },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model("Message", Message);

export default MessageModel
