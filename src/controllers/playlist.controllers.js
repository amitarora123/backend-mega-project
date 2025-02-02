import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErr.js";
import { Playlist } from "../models/playlist.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) throw new ApiError(400, "Playlist name is required");

  const playlist = await Playlist.create({
    name,
    description: description || "",
    owner: req.user?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID format");

  const playlists = await Playlist.find({ owner: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID format");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(400, "Playlist does not exist");

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (!(isValidObjectId(videoId) && isValidObjectId(playlistId))) {
    throw new ApiError(400, "Invalid video or playlist ID format");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(400, "Invalid videoId");

  const playlist = await Playlist.findOne({ _id: playlistId, videos: videoId });
  if (playlist) throw new ApiError(400, "Video already exists in the playlist");

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $push: { videos: videoId } },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (!(isValidObjectId(videoId) && isValidObjectId(playlistId))) {
    throw new ApiError(400, "Invalid video or playlist ID format");
  }

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(400, "Invalid videoId");

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID format");

  const userId = req.user?._id;
  const deletedPlaylist = await Playlist.findOneAndDelete({ _id: playlistId, owner: userId });

  if (!deletedPlaylist)
    throw new ApiError(400, "Playlist not found or user does not have access to delete");

  return res
    .status(200)
    .json(new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID format");

  const { name, description } = req.body;
  if (!name && !description) throw new ApiError(400, "At least one field is required for update");

  const updateFields = {};
  if (name) updateFields.name = name;
  if (description) updateFields.description = description;

  const updatedPlaylist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user?._id },
    { $set: updateFields },
    { new: true }
  );

  if (!updatedPlaylist)
    throw new ApiError(400, "Playlist not found or user does not have access to update");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
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
