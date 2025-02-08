import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
  getVideoLikes,
} from "../controllers/like.controllers.js";
import verifyJwt from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/toggle/v/:videoId").put(verifyJwt, toggleVideoLike);
router.route("/toggle/c/:commentId").put(verifyJwt, toggleCommentLike);
router.route("/toggle/t/:tweetId").put(verifyJwt, toggleTweetLike);
router.route("/videos").get(verifyJwt, getLikedVideos);
router.route("/getlikes/v/:videoId").get(verifyJwt, getVideoLikes);
export default router;
