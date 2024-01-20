import express from "express";
import {
  LoginUser,
  createUser,
  getStaff,
  verifyEmail,
  verifyUser,
} from "../domains/User/index.js";
import { authenticate } from "../../utils/middleware.js";
const router = express.Router();
// create user
router.route("/signup").post(createUser);
//verify user
router.route("/thegreenarea/verify-email/:token").get(verifyEmail);
// login user
router.route("/login").post(LoginUser);

// verfiy user
router.route("/thegreenarea/verify").get(verifyUser);

//send the user whose role is staff
router.route("/staffs").get(authenticate, getStaff )

export default router;
