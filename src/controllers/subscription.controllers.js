import { Subscription } from "../models/subscription.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErr.js";
import { isValidObjectId } from "mongoose";

const isSubscribed = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      200,
      { isSubscribed: req.owner.isSubscribed },
      "subscription details fetched successfully"
    );
});

const subscribeChannel = asyncHandler(async (req, res) => {
  if (req.owner.isSubscribed) {
    throw new ApiError(400, "user is alredy a subscriber");
  }

  const channelSubscribed = await Subscription.create({
    channel: req.owner?._id,
    subscriber: req.user?._id,
  });

  if (!channelSubscribed) {
    throw new ApiError(
      500,
      "internal server error couldn't subscribed to the channel"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelSubscribed, "channel subscribed successfully")
    );
});

const unSubscribeChannel = asyncHandler(async (req, res) => {
  if (!req.owner.isSubscribed) {
    throw new ApiError(400, "User has not subscribed to this channel");
  }

  const isUnsubscribed = await Subscription.deleteOne({
    channel: req.owner?._id,
    subscriber: req.user?._id,
  });

  if (isUnsubscribed.deletedCount === 0) {
    throw new ApiError(400, "User was not subscribed to this channel");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Channel unsubscribed successfully"));
});

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId))
    throw new ApiError(400, "please provide valid channelId");
  const userId = req.user._id;

  const isDeleted = await Subscription.deleteOne({
    channel: channelId,
    subscriber: userId,
  });

  if (isDeleted.deletedCount) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, isDeleted, "channel unsubscribed successfully")
      );
  }
  const channelSubscribed = await Subscription.create({
    channel: channelId,
    subscriber: userId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelSubscribed, "channel subscribed successfully")
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId))
    throw new ApiError(400, "provide valid channelId");
  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "fullName username avtar")
    .exec();
  res.status(200).json(subscribers);
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId))
    throw new ApiError(400, "provide valid subscriberId");

  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  })
    .select("-subscriber")
    .populate("channel", "fullName username avtar")
    .exec();

  if (!subscribeChannel) throw new ApiError(400, "user doesn't exist ");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "subscribed channels fetched successfully"
      )
    );
});

export {
  subscribeChannel,
  unSubscribeChannel,
  isSubscribed,
  getUserChannelSubscribers,
  getSubscribedChannels,
  toggleSubscription,
};
