import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteVideo,
  getAllvideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
  increaseView,
} from "../controllers/video.controllers.js";

const router = Router();

router.route("/").get(getAllvideos);


router.route("/").post(verifyJwt, 
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

router
  .route("/:videoId")
  .get(getVideoById)
  .delete(verifyJwt, deleteVideo)
  .patch(verifyJwt, upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(verifyJwt, togglePublishStatus);

router.route("/view/:videoId").patch(verifyJwt,increaseView);

export default router;
