import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiErr.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) throw new ApiError(400, "invalid channelId");
  const channelStats = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(channelId) } },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "channelVideos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "videoLikes",
            },
          },
          {
            $addFields: {
              totalVideoLikes: {
                $size: "$videoLikes",
              },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "channelSubscribers",
      },
    },
    {
      $addFields: {
        totalViews: {
          $sum: "$channelVideos.views",
        },
        totalLikes: {
          $sum: "$channelVideos.totalVideoLikes",
        },
        totalSubscribers: {
          $size: "$channelSubscribers",
        },
        totalVideos: {
          $size: "$channelVideos",
        },
      },
    },
    {
      $project: {
        _id: 1,
        fullName: 1,
        username: 1,
        email: 1,
        avtar: 1,
        videoFile: 1,
        totalVideos: 1,
        totalViews: 1,
        totalLikes: 1,
        totalSubscribers: 1,
      },
    },
  ]);

  if (!channelStats.length) throw new ApiError(400, "invalid channel id");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelStats[0],
        "channel stats fetched successfully"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;


  if (!isValidObjectId(channelId)) throw new ApiError("invalid channel id");

  const videos = await Video.find({ owner: channelId }).select("-owner");

  if (!videos.length) throw new ApiError(400, "channelId doesn't exist");

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
