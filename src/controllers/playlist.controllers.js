import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErr.js";
import { Playlist } from "../models/playlist.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) throw new ApiError(400, "name is required");

  const playlist = await Playlist.create({
    name: name,
    description: description ? description : "",
    owner: req.user?._id,
  });

  if (!playlist)
    throw new ApiError(500, "Internal server error, unable to create playlist");

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist created successfully"));
});
const getUserPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  const playlist = await Playlist.findOne({
    owner: userId,
  });

  if (!playlist) throw new ApiError(400, "playlist doesn't exist");

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) throw new ApiError(400, "playlist id is rquired");

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) throw new ApiError(400, "playlist doesn't exist");

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (!(videoId && playlistId))
    throw new ApiError(400, "all fields are rquired");

  const playlist = await Playlist.findOne({
    _id: playlistId,
    videos: { $in: [videoId] }, // Check if video already exists
  });

  if (playlist) {
    throw new ApiError(400, "Video already exists in the playlist");
  }

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(400, "Invalid videoId");

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: { videos: videoId },
    },
    { new: true }
  );

  if (!updatedPlaylist) throw new ApiError(400, "invalid playlist id");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "playlist updated successfully")
    );
});
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (!(videoId && playlistId))
    throw new ApiError(400, "all fields are rquired");

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(400, "Invalid videoId");

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  );

  if (!updatedPlaylist) throw new ApiError(400, "invalid playlist id");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "playlist updated successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) throw new ApiError(400, "playlist id is required");

  const userId = req.user?._id;

  const deletedPlaylist = await Playlist.deleteOne({
    _id: playlistId,
    owner: userId,
  });

  if (!deletedPlaylist)
    throw new ApiError(
      400,
      "playlist doesn't exist or user doesn't have access to delete the playlist"
    );

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) throw new ApiError(400, "playlist id is required");

  const { name, description } = req.body;

  if (!(name || description))
    throw new ApiError(400, "one update field is required");

  const updateFields = {};
  if (name) updateFields.name = name;
  if (description) updateFields.description = description;

  console.log(updateFields);

  const isUpdated = await Playlist.updateOne(
    { _id: playlistId, owner: req.user?._id },
    {
      $set: updateFields,
    }
  );

  if (!isUpdated)
    throw new ApiError(
      400,
      "user can't update the playlist or playlist doesn't exist"
    );

  const updatedPlaylist = await Playlist.findById(playlistId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "playlist updated successfully")
    );
});
export {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
