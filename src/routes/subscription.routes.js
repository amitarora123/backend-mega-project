import { Router } from "express";
import {
  subscribeChannel,
  unSubscribeChannel,
} from "../controllers/subscription.controllers.js";
import verifyJwt from "../middlewares/auth.middleware.js";
import { isUserSubscribedMiddleware } from "../middlewares/isSubscribed.middlware.js";

const router = Router();

router
  .route("/subscribe/c/:channel")
  .post(verifyJwt, isUserSubscribedMiddleware, subscribeChannel);
router
  .route("/unsubscribe/c/:channel")
  .delete(verifyJwt, isUserSubscribedMiddleware, unSubscribeChannel);

export default router;
