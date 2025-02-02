import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiErr.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

const getAllvideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType } = req.query;
  if (!["views", "title", "duration"].includes(sortBy)) {
    throw new ApiError(
      400,
      "invalid sort by value the value should only be [views, subscribers, duration]"
    );
  }

  const sortOrder = sortType === "desc" ? -1 : 1;

  const videos = await Video.find({
    title: { $regex: query, $options: "i" },
  })
    .sort({ sortBy: sortOrder })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    throw new ApiError(400, "title is required");
  }

  const videoLocalPath = req.files.videoFile[0].path;
  const thumbnailLocalPath = req.files.thumbnail[0].path;

  if (!(videoLocalPath && thumbnailLocalPath)) {
    throw new ApiError(400, "video and thumbnail is required");
  }

  const videoUrl = await uploadOnCloudinary(videoLocalPath);
  const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);

  if (!(videoUrl && thumbnailUrl)) {
    throw new ApiError(500, "internal server error could not upload video ");
  }

  const video = await Video.create({
    videoFile: videoUrl?.url,
    thumbnail: thumbnailUrl?.url,
    owner: req.user?._id,
    duration: videoUrl.duration,
    title: title,
    description: description,
  });

  if (!video) {
    throw new ApiError(500, "internal server error couldn't publish the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "invalid video id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!(title || description || thumbnailLocalPath)) {
    throw new ApiError(400, "atleast one update field is required");
  }
  let thumbnailUrl;
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(400, "video doesn't exist");
  if (thumbnailLocalPath) {
    const isDeleted = await deleteFromCloudinary(video.thumbnail);
    if (!isDeleted) {
      throw new ApiError(
        500,
        "internal server error old thumbnail couldn't be deleted"
      );
    }
    thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);
  }

  if (title) video.title = title;
  if (description) video.description = description;
  if (thumbnailUrl) video.thumbnail = thumbnailUrl.url;

  await video.save();

  const updatedVideo = await Video.findById(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) throw new ApiError(400, "video id is required");

  const deletedVideo = await Video.deleteOne({ _id: videoId });

  if (!deletedVideo) throw new ApiError(400, "couldn't delete the video");

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "video id is required");

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: { isPublished: !"$isPublished" },
    },
    { new: true }
  );
  if (!updatedVideo)
    throw new ApiError(400, "video with that video id does not exist");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "video updated successfully"));
});
const increaseView = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  ).select("-owner");

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video viewed successfully"));
});
export {
  getAllvideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  increaseView,
};
