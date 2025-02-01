import { Router } from "express";
import {
  subscribeChannel,
  unSubscribeChannel,
} from "../controllers/subscription.controllers.js";
import verifyJwt from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/subscribe/c/:channel").post(verifyJwt, subscribeChannel);
router.route("/unsubscribe/c/:channel").delete(verifyJwt, unSubscribeChannel);

export default router;
