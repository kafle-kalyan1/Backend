import catchAsync from "../../../utils/catchAsync.js";
import Postmodel from "../../../models/PostInfo.js";
import CommentModel from "../../../models/CommentInfo.js";

export const createPost = catchAsync(async (req, res, next) => {
  try {
    const { picture, content, location, datePick, isEvent } = req.body;
    if (!picture && !content) {
      return res.status(422).json({ message: "Post can't be empty" });
    }
    const userdata = new Postmodel({
      picture,
      content,
      location,
      datePick,
      isEvent,
      postedBy: req.user._id,
    });

    await userdata.save();
    res.status(201).json({ message: "Successfully! created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create post" });
  }
});

export const getAllPost = catchAsync(async (req, res, next) => {
  try {
    const result = await Postmodel.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "_id profilePic fullname gender")
      .exec();

    res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get all posts" });
  }
});

//like the post
export const likePost = catchAsync(async (req, res, next) => {
  try {
    let responseSent = false;
    Postmodel.findById(req.body.postId)
      .populate("postedBy", "_id")
      .exec()
      .then((post) => {
        if (post.likes.includes(req.user._id)) {
          // User already liked the post
          if (!responseSent) {
            responseSent = true;
            return res
              .status(200)
              .json({ message: "User already liked the post" });
          }
        }
        return Postmodel.findByIdAndUpdate(
          req.body.postId,
          { $addToSet: { likes: req.user._id } },
          { new: true }
        ).exec();
      })
      .then((result) => {
        return res.status(200).json({ message: "Post liked", result });
      })
      .catch((err) => {
        if (!responseSent) {
          return res.status(422).json({ error: err });
        }
      });
  } catch (err) {
    throw new Error(err);
  }
});

//unlike the post
export const unlikePost = catchAsync(async (req, res, next) => {
  Postmodel.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .exec()
    .then((result) => {
      res.json({ result });
    })
    .catch((err) => {
      return res.status(422).json({ error: err });
    });
});

//   create the comment
export const createComment = catchAsync(async (req, res) => {
  try {
    const postId = req.params.postId;
    const authorId = req.user._id.toString();
    const body = req.body.comment;
    const comment = new CommentModel({
      body,
      author: authorId,
      post: postId,
    });

    const savedComment = await comment.save();
    res
      .status(200)
      .json({ message: "Comment successfully added", savedComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// delete comment
export const deleteComment = catchAsync(async (req, res, next) => {
  try {
    console.log(req.params.commentId);
    const result = await CommentModel.deleteOne({ _id: req.params.commentId });
    console.log(result);
    if (result.deletedCount > 0) {
      res
        .status(200)
        .json({ success: true, message: "Comment deleted successfully" });
    } else {
      res.status(500).json({ success: false, message: "Comment not found" });
    }
  } catch (error) {
    throw new Error(error);
  }
});

// get comment
export const getComments = catchAsync(async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const comments = await CommentModel.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePic gender");
    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const getEvenets = catchAsync(async (req, res, next) => {
    try{
      const result = await Postmodel.find({isEvent: true})
      .sort({ createdAt: -1 }).populate("postedBy","_id username profilePic gender fullname")
      res.status(200).json({ result });
    }
    catch(err){
      console.log(err);
      res.status(500).json({ message: "Failed to get all events" });
    }
  });

export const fetchMyPost = catchAsync(async (req, res, next) => {
    try {
      const myPosts = await Postmodel.find({ postedBy: req.params.id }).populate(
        "postedBy","_id username profilePic gender fullname")
      res.status(200).json(myPosts);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to fetch own stories" });
    }
  });