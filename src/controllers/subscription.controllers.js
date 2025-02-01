import { Subscription } from "../models/subscription.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErr.js";
import { User } from "../models/user.models.js";

// const isSubscribed = asyncHandler(async (req, res) => {
//   const incomingChannel = req.params.channel;

//   if (!channel) {
//     throw new ApiError(400, "channel does not exist");
//   }
//   const subscribedChannel = await Subscription.aggregate([
//     {
//       $match: {
//         channel: incomingChannel,
//       },
//     },

//     {
//       $addFields: {
//         isSubscribed: {},
//       },
//     },
//   ]);

//   if (!subscribedChannel) {
//     return res.status(200).json(new ApiResponse(200, { isSubscribed: false }));
//   }
// });

const subscribeChannel = asyncHandler(async (req, res) => {
  const channel = req.params.channel;

  const owner = await User.findOne({
    username: channel,
  }).select("-password -refreshToken -watchHistory");

  if (!owner) {
    throw new ApiError(400, "Channel doesn't exist ");
  }
  console.log(owner?._id);

  const subscribedChannel = await Subscription.findOne({
    $and: [{ channel: owner._id }, { subscriber: req.user?._id }],
  });

  console.log(subscribedChannel);

  if (subscribedChannel) {
    throw new ApiError(400, "user is alredy a subscriber");
  }

  const channelSubscribed = await Subscription.create({
    channel: owner?._id,
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
  const incomingChannelUserName = req.params.channel;

  if (!incomingChannelUserName) {
    throw new ApiError(400, "channel doesn't exist");
  }

  const owner = await User.findOne({
    username: incomingChannelUserName,
  }).select("-password -refreshToken -watchHistory");

  if (!owner) {
    throw new ApiError(400, "Channel doesn't exist ");
  }

  const isUnsubscribed = await Subscription.deleteOne({
    $and: [{ channel: owner?._id }, { subscriber: req.user?._id }],
  });

  if (!isUnsubscribed) {
    throw new Apierror(
      500,
      "internal server error couldn't unsubscribe the channel"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, isUnsubscribed, "channel unsubscribed  successfully"));
});

export { subscribeChannel, unSubscribeChannel };
