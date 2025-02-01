import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";

export const isUserSubscribedMiddleware = asyncHandler(async (req, _, next) => {
  const incomingChannelUserName = req.params.channel;

  if (!incomingChannelUserName) {
    throw new ApiError(400, "Channel username is required");
  }

  const owner = await User.findOne({
    username: incomingChannelUserName,
  }).select("-password -refreshToken -watchHistory");

  if (!owner) {
    throw new ApiError(400, "Channel doesn't exist");
  }

  const subscribedChannel = await Subscription.findOne({
    channel: owner._id,
    subscriber: req.user?._id,
  });

  // ✅ Attach values directly to `req`
  req.owner = owner;
  req.owner.isSubscribed = !!subscribedChannel; // Convert to boolean

  next(); // Call next() after updating req
});
