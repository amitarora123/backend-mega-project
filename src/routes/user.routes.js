import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvtar
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
router.route("/refresh-token").post(verifyJwt, refreshAccessToken);
router
  .route("/change-password")
  .post(upload.none(), verifyJwt, changeCurrentPassword);
router
  .route("/change-details")
  .post(upload.none(), verifyJwt, updateAccountDetails);

router
  .route("/update-avtar")
  .post(upload.single("avtar"), verifyJwt, updateUserAvtar);
export default router;
