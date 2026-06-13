import { motion } from "framer-motion";
import { Bookmark, Heart, MessageCircle, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { API_URL, api } from "../api/client";

export function VideoCard({ video, active, muted, onComment, onLocalUpdate, onToggleMute }) {
  const [pausedByUser, setPausedByUser] = useState(false);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [liking, setLiking] = useState(false);
  const pausedByUserRef = useRef(false);
  const videoRef = useRef(null);

  function playVideo(element, shouldMute = muted) {
    setSoundBlocked(false);
    element.muted = shouldMute;
    element.defaultMuted = shouldMute;
    element.volume = shouldMute ? 0 : 1;

    element.play().catch(() => {
      if (!shouldMute) {
        setSoundBlocked(true);
      }

      element.muted = true;
      element.defaultMuted = true;
      element.volume = 0;
      element.play().catch(() => {});
    });
  }

  useEffect(() => {
    pausedByUserRef.current = false;
    setSoundBlocked(false);
    setPausedByUser(false);
  }, [video.id]);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    if (!active) {
      pausedByUserRef.current = false;
      setPausedByUser(false);
      element.pause();
      element.currentTime = 0;
      element.muted = true;
      element.defaultMuted = true;
      return;
    }

    if (pausedByUser) {
      element.pause();
    } else {
      playVideo(element);
    }
  }, [active, muted, pausedByUser]);

  function handleToggleMute() {
    const nextMuted = !muted;
    const element = videoRef.current;

    if (element && active) {
      if (!pausedByUser) {
        playVideo(element, nextMuted);
      } else {
        element.muted = nextMuted;
        element.defaultMuted = nextMuted;
        element.volume = nextMuted ? 0 : 1;
      }
    }

    onToggleMute(nextMuted);
  }

  function handleVideoPress(event) {
    if (event.target.closest("button, a, input, textarea")) {
      return;
    }

    const element = videoRef.current;

    if (!element || !active) {
      return;
    }

    if (pausedByUserRef.current || element.paused) {
      pausedByUserRef.current = false;
      setPausedByUser(false);
      playVideo(element);
    } else if (soundBlocked && !muted) {
      playVideo(element, false);
    } else {
      pausedByUserRef.current = true;
      setPausedByUser(true);
      element.pause();
    }
  }

  async function handleLike() {
    if (video.liked_by_me || liking) {
      return;
    }

    const previousCount = Number(video.like_count) || 0;
    setLiking(true);
    onLocalUpdate(video.id, {
      liked_by_me: true,
      like_count: previousCount + 1
    });

    try {
      const { data } = await api.post(`/videos/${video.id}/like`);
      onLocalUpdate(video.id, {
        liked_by_me: true,
        like_count: Number(data.video.like_count) || previousCount + 1
      });
    } catch {
      onLocalUpdate(video.id, {
        liked_by_me: false,
        like_count: previousCount
      });
    } finally {
      setLiking(false);
    }
  }

  async function handleBookmark() {
    const nextBookmarked = !video.bookmarked_by_me;
    onLocalUpdate(video.id, { bookmarked_by_me: nextBookmarked });

    try {
      const { data } = await api.post(`/videos/${video.id}/bookmark`);
      onLocalUpdate(video.id, { bookmarked_by_me: data.bookmarked });
    } catch {
      onLocalUpdate(video.id, { bookmarked_by_me: video.bookmarked_by_me });
    }
  }

  const src = video.file_path?.startsWith("http")
    ? video.file_path
    : `${API_URL}${video.file_path}`;

  return (
    <section className={`video-card ${active ? "is-active" : ""}`} data-video-card data-video-id={video.id} onPointerUp={handleVideoPress}>
      <video ref={videoRef} className="short-video" src={src} muted={muted} autoPlay={active} onCanPlay={() => active && !pausedByUser && videoRef.current && playVideo(videoRef.current)} loop playsInline preload="auto" />
      <div className="video-gradient" />

      {active && soundBlocked && !muted && (
        <button
          className="sound-unlock"
          onClick={(event) => {
            event.stopPropagation();
            if (videoRef.current) {
              playVideo(videoRef.current, false);
            }
          }}
          onPointerUp={(event) => event.stopPropagation()}
          type="button"
        >
          Tap for sound
        </button>
      )}

      <motion.div className="video-copy" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
        <span>{video.category}</span>
        <h2>{video.title}</h2>
        <p>{video.description}</p>
      </motion.div>

      <div className="action-stack" onClick={(event) => event.stopPropagation()} onPointerUp={(event) => event.stopPropagation()}>
        <button
          className="round-action"
          onClick={handleToggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX size={23} /> : <Volume2 size={23} />}
        </button>
        <button
          className={`round-action like-action ${video.liked_by_me ? "active liked-pop" : ""}`}
          onClick={handleLike}
          aria-label="Like video"
          title="Like"
          disabled={liking}
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
