import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvtar,
  updateUserCoverImage,
  getUserChannel,
  getWatchHistory,
} from "../controllers/user.controllers.js";
import verifyJwt from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avtar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(upload.none(), loginUser);

//secure routes

router.route("/logout").post(verifyJwt, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router
  .route("/change-password")
  .patch(upload.none(), verifyJwt, changeCurrentPassword);

router
  .route("/change-details")
  .patch(upload.none(), verifyJwt, updateAccountDetails);

router
  .route("/update-avtar")
  .patch(upload.single("avtar"), verifyJwt, updateUserAvtar);

router
  .route("/update-coverImage")
  .patch(upload.single("coverImage"), verifyJwt, updateUserCoverImage);

router.route("/channel-profile/c/:channel").get(verifyJwt, getUserChannel);

router.route("/watchHistory").get(verifyJwt, getWatchHistory);

export default router;
