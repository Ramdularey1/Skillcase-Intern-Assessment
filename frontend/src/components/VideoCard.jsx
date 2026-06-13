import { motion } from "framer-motion";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import { API_URL, api } from "../api/client";
import { useInViewVideo } from "../hooks/useInViewVideo";

export function VideoCard({ video, onComment, onLocalUpdate }) {
  const videoRef = useInViewVideo();

  async function handleLike() {
    if (video.liked_by_me) {
      return;
    }

    onLocalUpdate(video.id, {
      liked_by_me: true,
      like_count: Number(video.like_count) + 1
    });

    try {
      const { data } = await api.post(`/videos/${video.id}/like`);
      onLocalUpdate(video.id, {
        liked_by_me: true,
        like_count: data.video.like_count
      });
    } catch {
      onLocalUpdate(video.id, {
        liked_by_me: false,
        like_count: Math.max(Number(video.like_count), 0)
      });
    }
  }

  async function handleBookmark() {
    onLocalUpdate(video.id, { bookmarked_by_me: true });

    try {
      await api.post(`/videos/${video.id}/bookmark`);
    } catch {
      onLocalUpdate(video.id, { bookmarked_by_me: false });
    }
  }

  const src = video.file_path?.startsWith("http")
    ? video.file_path
    : `${API_URL}${video.file_path}`;

  return (
    <section className="video-card">
      <video ref={videoRef} className="short-video" src={src} muted loop playsInline preload="metadata" />
      <div className="video-gradient" />

      <motion.div className="video-copy" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
        <span>{video.category}</span>
        <h2>{video.title}</h2>
        <p>{video.description}</p>
      </motion.div>

      <div className="action-stack">
        <button
          className={`round-action ${video.liked_by_me ? "active" : ""}`}
          onClick={handleLike}
          aria-label="Like video"
          title="Like"
        >
          <Heart size={23} fill={video.liked_by_me ? "currentColor" : "none"} />
          <span>{video.like_count}</span>
        </button>
        <button className="round-action" onClick={() => onComment(video)} aria-label="Open comments" title="Comments">
          <MessageCircle size={23} />
        </button>
        <button
          className={`round-action ${video.bookmarked_by_me ? "saved" : ""}`}
          onClick={handleBookmark}
          aria-label="Bookmark video"
          title="Bookmark"
        >
          <Bookmark size={23} fill={video.bookmarked_by_me ? "currentColor" : "none"} />
        </button>
      </div>
    </section>
  );
}
