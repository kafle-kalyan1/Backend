import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema(
  {
    picture: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    location: {
      type: Object,
      default: {},
    },
    postedBy: {
      type: ObjectId,
      ref: "userInformation",
    },
    datePick: {
      type: String,
      default: "",
    },
    isEvent: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: ObjectId,
        ref: "userInformation",
      },
    ],
  },
  { timestamps: true }
);

const Postmodel = mongoose.model("post", userSchema);

export default Postmodel;
