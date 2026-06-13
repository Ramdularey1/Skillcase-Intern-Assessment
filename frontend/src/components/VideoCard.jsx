import { motion } from "framer-motion";
import { Bookmark, Heart, MessageCircle, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { API_URL, api } from "../api/client";

export function VideoCard({ video, active, muted, onComment, onLocalUpdate, onToggleMute }) {
  const [pausedByUser, setPausedByUser] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setPausedByUser(false);
  }, [video.id]);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    if (!active) {
      element.pause();
      element.currentTime = 0;
      element.muted = true;
      element.defaultMuted = true;
      return;
    }

    element.muted = muted;
    element.defaultMuted = muted;
    element.volume = muted ? 0 : 1;

    if (pausedByUser) {
      element.pause();
    } else {
      element.play().catch(() => {});
    }
  }, [active, muted, pausedByUser]);

  function handleToggleMute() {
    const nextMuted = !muted;
    const element = videoRef.current;

    if (element && active) {
      element.muted = nextMuted;
      element.defaultMuted = nextMuted;
      element.volume = nextMuted ? 0 : 1;

      if (!nextMuted && !pausedByUser) {
        element.play().catch(() => {});
      }
    }

    onToggleMute(nextMuted);
  }

  function handleVideoClick() {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    if (element.paused) {
      setPausedByUser(false);
      element.muted = muted;
      element.defaultMuted = muted;
      element.volume = muted ? 0 : 1;
      element.play().catch(() => {});
    } else {
      setPausedByUser(true);
      element.pause();
    }
  }

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
    <section className="video-card" data-video-card data-video-id={video.id} onClick={handleVideoClick}>
      <video ref={videoRef} className="short-video" src={src} muted={muted} loop playsInline preload="auto" />
      <div className="video-gradient" />

      <motion.div className="video-copy" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
        <span>{video.category}</span>
        <h2>{video.title}</h2>
        <p>{video.description}</p>
      </motion.div>

      <div className="action-stack" onClick={(event) => event.stopPropagation()}>
        <button
          className="round-action"
          onClick={handleToggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX size={23} /> : <Volume2 size={23} />}
        </button>
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
