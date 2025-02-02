import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comments.models.js";
import { ApiError } from "../utils/ApiErr.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId))
    throw new ApiError(400, "provide valid videoId");

  const { page = 1, limit = 10 } = req.query;

  const comments = await Comment.find({ video: videoId })
    .select("-video")
    .populate("owner", "fullName username avtar")
    .skip((page - 1) * limit)
    .limit(parseInt(limit));


  return res
    .status(200)
    .json(new ApiResponse(200, comments, "comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;
  if (!content) throw new ApiError(400, "content is required");

  const userId = req.user?._id;

  const comment = await Comment.create({
    content: content,
    owner: userId,
    video: videoId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) throw new ApiError(400, "invalid commentId");

  const { content } = req.body;
  if (!content) throw new ApiError(400, "content is required");

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      content: content,
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) throw new ApiError(400, "invalid commentId");

  const deletedComment = await Comment.deleteOne({ _id: commentId });

  if (!deletedComment.deletedCount)
    throw new ApiError(400, "comment doesn't exist ");

  return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
