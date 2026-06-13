import { LogIn, LogOut, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { CommentSheet } from "../components/CommentSheet";
import { VideoCard } from "../components/VideoCard";
import { logout } from "../redux/authSlice";

export function FeedPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const feedTrackRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const [activeComments, setActiveComments] = useState(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/videos")
      .then(({ data }) => {
        setVideos(data.videos);
        setActiveVideoId(data.videos[0]?.id || null);
      })
      .catch(() => setError("Could not load videos"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const container = feedTrackRef.current;

    if (!container || videos.length === 0) {
      return undefined;
    }

    const ratios = new Map();
    const cards = [...container.querySelectorAll("[data-video-card]")];

    const selectMostVisible = () => {
      let nextActiveId = activeVideoId || videos[0]?.id;
      let bestRatio = 0;

      for (const card of cards) {
        const ratio = ratios.get(card.dataset.videoId) || 0;

        if (ratio > bestRatio) {
          bestRatio = ratio;
          nextActiveId = card.dataset.videoId;
        }
      }

      if (nextActiveId) {
        setActiveVideoId(nextActiveId);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.dataset.videoId, entry.intersectionRatio);
        }

        selectMostVisible();
      },
      { root: container, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [activeVideoId, videos]);

  function updateVideo(id, patch) {
    setVideos((current) =>
      current.map((video) => (video.id === id ? { ...video, ...patch } : video))
    );
  }

  return (
    <main className="feed-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          Skillcase Shorts
        </Link>
        <nav>
          <Link className="icon-button" to="/new" aria-label="Add video" title="Add video">
            <Plus size={19} />
          </Link>
          {user ? (
            <button className="icon-button" onClick={() => dispatch(logout())} aria-label="Logout" title="Logout">
              <LogOut size={19} />
            </button>
          ) : (
            <Link className="icon-button" to="/login" aria-label="Login" title="Login">
              <LogIn size={19} />
            </Link>
          )}
        </nav>
      </header>

      {loading && <div className="center-state">Loading shorts...</div>}
      {error && <div className="center-state error-text">{error}</div>}
      {!loading && !error && videos.length === 0 && (
        <div className="center-state">Add videos from the backend to start the feed.</div>
      )}

      <div className="feed-track" ref={feedTrackRef}>
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            active={video.id === activeVideoId}
            muted={audioMuted}
            onComment={setActiveComments}
            onToggleMute={setAudioMuted}
            onLocalUpdate={updateVideo}
          />
        ))}
      </div>

      <CommentSheet
        open={Boolean(activeComments)}
        video={activeComments}
        onClose={() => setActiveComments(null)}
      />
    </main>
  );
}
