import express from "express";
import { authenticate } from "../../utils/middleware.js";
import {
  createComment,
  createPost,
  deleteComment,
  fetchMyPost,
  getAllPost,
  getComments,
  getEvenets,
  likePost,
  unlikePost,
} from "../domains/Post/index.js";
const router = express.Router();

// create post
router.route("/createpost").post(authenticate, createPost);

//get all post
router.route("/getAllPost").get(authenticate, getAllPost);

//like all post
router.route("/like").put(authenticate, likePost);

// unlike the post
router.route("/unlike").put(authenticate, unlikePost);

//create comment the post
router.route("/:postId/comment").post(authenticate, createComment);

// delte comment the post
router.route("/comment/:commentId").delete(authenticate, deleteComment);


//get commnent
router.route("/:postId/comments").get(authenticate, getComments);

router.route("/upcoming-events").get(authenticate, getEvenets);

router.route("/fetchMyPost/:id").get(authenticate,fetchMyPost); 

  
export default router;
