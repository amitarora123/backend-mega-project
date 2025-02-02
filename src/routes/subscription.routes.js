import { Router } from "express";
import {
  subscribeChannel,
  unSubscribeChannel,
  getUserChannelSubscribers,
  getSubscribedChannels,
  toggleSubscription,
} from "../controllers/subscription.controllers.js";
import verifyJwt from "../middlewares/auth.middleware.js";
import { isUserSubscribedMiddleware } from "../middlewares/isSubscribed.middlware.js";

const router = Router();

router.use(verifyJwt);

router
  .route("/subscribe/c/:channel")
  .post(isUserSubscribedMiddleware, subscribeChannel);
router
  .route("/unsubscribe/c/:channel")
  .delete(isUserSubscribedMiddleware, unSubscribeChannel);

router
  .route("/subscribers/channelId/:channelId")
  .get(getUserChannelSubscribers);

router
  .route("/subscribedChannels/subscriberId/:subscriberId")
  .get(getSubscribedChannels);

router.route("/toggleSubscription/c/:channelId").post(toggleSubscription);
export default router;
