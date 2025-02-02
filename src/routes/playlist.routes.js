import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  getPlaylistById,
  getUserPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controllers.js";
import verifyJwt from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.use(verifyJwt);
router.use(upload.single(null));

router.route("/").post(createPlaylist);

router.route("/:userId").get(getUserPlaylist);

router
  .route("/p/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

router
  .route("/p/:playlistId/v/:videoId")
  .patch(addVideoToPlaylist)
  .delete(removeVideoFromPlaylist);

export default router;
