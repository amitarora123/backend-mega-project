import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controllers.js";

import verifyJwt from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/stats/c/:channelId").get(getChannelStats);
router.route("/videos/c/:channelId").get(getChannelVideos);

export default router;
