import { LogIn, LogOut } from "lucide-react";
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
  const accountMenuRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const [activeComments, setActiveComments] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [audioMuted, setAudioMuted] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleDocumentPointerDown(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    return () => document.removeEventListener("pointerdown", handleDocumentPointerDown);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadVideos({ showLoading = false } = {}) {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const { data } = await api.get("/videos");

        if (!mounted) {
          return;
        }

        setVideos(data.videos);
        setActiveVideoId((current) => current || data.videos[0]?.id || null);
        setError("");
      } catch {
        if (mounted) {
          setError("Could not load videos");
        }
      } finally {
        if (mounted && showLoading) {
          setLoading(false);
        }
      }
    }

    loadVideos({ showLoading: true });
    const refreshTimer = window.setInterval(() => loadVideos(), 3000);

    return () => {
      mounted = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    const container = feedTrackRef.current;

    if (!container || videos.length === 0) {
      return undefined;
    }

    let frameId = 0;
    const selectCenteredVideo = () => {
      const cards = [...container.querySelectorAll("[data-video-card]")];
      const containerRect = container.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;
      let nextActiveId = videos[0]?.id || null;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const cardCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenterY - centerY);

        if (distance < bestDistance) {
          bestDistance = distance;
          nextActiveId = card.dataset.videoId;
        }
      }

      if (nextActiveId) {
        setActiveVideoId(nextActiveId);
      }
    };

    const scheduleSelection = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(selectCenteredVideo);
    };

    selectCenteredVideo();
    container.addEventListener("scroll", scheduleSelection, { passive: true });
    window.addEventListener("resize", scheduleSelection);

    return () => {
      window.cancelAnimationFrame(frameId);
      container.removeEventListener("scroll", scheduleSelection);
      window.removeEventListener("resize", scheduleSelection);
    };
  }, [videos]);

  function updateVideo(id, patch) {
    setVideos((current) =>
      current.map((video) => (video.id === id ? { ...video, ...patch } : video))
    );
  }

  return (
    <main className="feed-shell">
      <header className="topbar">
        <Link className="brand" to="/feed">
          <span className="brand-mark">S</span>
          <span>Skillcase Shorts</span>
        </Link>
        <nav>
          {user && (
            <div className="account-menu-wrap" ref={accountMenuRef}>
              <button
                className="avatar-button"
                onClick={() => setAccountOpen((current) => !current)}
                aria-label="Open account menu"
                aria-expanded={accountOpen}
                title={user.email}
              >
                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
              </button>
              {accountOpen && (
                <div className="account-popover">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              )}
            </div>
          )}
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

      {loading && (
        <div className="feed-shimmer" aria-label="Loading shorts">
          <div className="shimmer-phone">
            <div className="shimmer-top" />
            <div className="shimmer-copy">
              <div className="shimmer-pill shimmer" />
              <div className="shimmer-title shimmer" />
              <div className="shimmer-line shimmer" />
              <div className="shimmer-line short shimmer" />
            </div>
            <div className="shimmer-actions">
              <span className="shimmer-circle shimmer" />
              <span className="shimmer-circle shimmer" />
              <span className="shimmer-circle shimmer" />
            </div>
          </div>
        </div>
      )}
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
