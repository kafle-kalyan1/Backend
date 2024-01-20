import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserInfoModel from "../models/UserInfo.js";
import catchAsync from "./catchAsync.js";
import createError from "./createError.js";

dotenv.config();

export const authenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("something", authHeader);
  if (!(authHeader && authHeader.toLowerCase().startsWith("bearer")))
    throw createError(
      401,
      "You are not logged in. Please login to get access."
    );
  const token = authHeader.split(" ")[1];
  console.log("this is token", token);
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = await UserInfoModel.findById(decoded.userId);
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw createError(401, "Your session has expired. Please log in again.");
    } else {
      throw createError(401, "Invalid token.");
    }
  }
});

export const permission = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    throw createError(403, "You are not allowed to access this route.");
  next();
};
