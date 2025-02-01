import { Subscription } from "../models/subscription.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErr.js";

const isSubscribed = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      200,
      { channel: req.owner },
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

export { subscribeChannel, unSubscribeChannel, isSubscribed };
