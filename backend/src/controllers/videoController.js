import {
  bookmarkVideo,
  createComment,
  createVideo,
  getComments,
  getVideoById,
  getVideos,
  likeVideo
} from "../services/videoService.js";

export async function createVideoHandler(req, res) {
  const video = await createVideo(req.validated.body);
  res.status(201).json({ video });
}

export async function getVideosHandler(req, res) {
  const videos = await getVideos(req.user?.id);
  res.json({ videos });
}

export async function getVideoHandler(req, res) {
  const video = await getVideoById(req.validated.params.id, req.user?.id);
  res.json({ video });
}

export async function likeVideoHandler(req, res) {
  const result = await likeVideo(req.validated.params.id, req.user.id);
  res.json(result);
}

export async function bookmarkVideoHandler(req, res) {
  const result = await bookmarkVideo(req.validated.params.id, req.user.id);
  res.json(result);
}

export async function createCommentHandler(req, res) {
  const comment = await createComment(
    req.validated.params.id,
    req.user.id,
    req.validated.body.content
  );
  res.status(201).json({ comment });
}

export async function getCommentsHandler(req, res) {
  const comments = await getComments(req.validated.params.id);
  res.json({ comments });
}
