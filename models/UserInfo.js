import mongoose  from "mongoose";
const { ObjectId } = mongoose.Schema.Types;


const UserInfoSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "staff"],
    default: "user",
  },
  who:{
    type: String,
    default: "UNICEF",
  },
  profilePic: {
    type: String,
    default: "",
  },
  verificationToken: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    default: "",
  },
  isVerified: {
    type: Number,
    default: 0,
  },
});

const UserInfoModel = mongoose.model("userInformation", UserInfoSchema);

export default UserInfoModel;
