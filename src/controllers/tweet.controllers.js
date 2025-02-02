import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweets.models.js";
import { ApiError } from "../utils/ApiErr.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) throw new ApiError(400, "content is required");
  const userId = req.user._id;

  const tweet = await Tweet.create({
    content: content,
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) throw new ApiError(400, "invalid userId");
  const tweets = await Tweet.find({ owner: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) throw new ApiError(400, "invalid tweetId");

  const { content } = req.body;
  if (!content) throw new ApiError(400, "content is required");

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      content: content,
    },
    { new: true }
  );

  if (!updatedTweet) throw new ApiError(400, "tweet doesn't exist");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) throw new ApiError(400, "invalid tweetId");

  const deletedTweet = await Tweet.deleteOne({ _id: tweetId });

  if (!deletedTweet.deletedCount) throw new ApiError(400, "tweet doesn't exist");

  return res
    .status(200)
    .json(new ApiResponse(200, "tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
