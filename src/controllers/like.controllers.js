import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/likes.models.js";
import { ApiError } from "../utils/ApiErr.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "invalid videoId");

  const likedVideo = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });
  let response;
  if (likedVideo) {
    response = await Like.deleteOne({ video: videoId, likedBy: req.user?._id });
  } else {
    response = await Like.create({ video: videoId, likedBy: req.user?._id });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, response, "liked toggled successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) throw new ApiError(400, "invalid commentId");

  const likedComment = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });
  let response;
  if (likedComment) {
    response = await Like.deleteOne({
      comment: commentId,
      likedBy: req.user?._id,
    });
  } else {
    response = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, response, "like toggled successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) throw new ApiError(400, "invalid tweetId");

  const likedTweet = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });
  let response;
  if (likedTweet) {
    response = await Like.deleteOne({ tweet: tweetId, likedBy: req.user?._id });
  } else {
    response = await Like.create({ tweet: tweetId, likedBy: req.user?._id });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, response, "like toggled successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const likedVideos = await Like.find({ likedBy: userId })
    .select("-comment -tweet -likedBy")
    .populate("video", "videoFile thumbnail owner duration title views")
    .exec();

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
