import { Router } from "express";
import { z } from "zod";
import {
  bookmarkVideoHandler,
  createCommentHandler,
  createVideoHandler,
  getCommentsHandler,
  getVideoHandler,
  getVideosHandler,
  likeVideoHandler
} from "../controllers/videoController.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";

const router = Router();

const idParams = z.object({
  params: z.object({
    id: z.string().uuid("Video id must be a valid UUID")
  })
});

const createVideoSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().min(2),
    category: z.string().min(2),
    file_path: z.string().min(2)
  })
});

const commentSchema = idParams.extend({
  body: z.object({
    content: z.string().min(1, "Comment cannot be empty").max(500)
  })
});

router.post("/", authMiddleware, validate(createVideoSchema), asyncHandler(createVideoHandler));
router.get("/", asyncHandler(getVideosHandler));
router.get("/:id", validate(idParams), asyncHandler(getVideoHandler));
router.post("/:id/like", authMiddleware, validate(idParams), asyncHandler(likeVideoHandler));
router.post(
  "/:id/bookmark",
  authMiddleware,
  validate(idParams),
  asyncHandler(bookmarkVideoHandler)
);
router.post(
  "/:id/comment",
  authMiddleware,
  validate(commentSchema),
  asyncHandler(createCommentHandler)
);
router.get("/:id/comments", validate(idParams), asyncHandler(getCommentsHandler));

export default router;
