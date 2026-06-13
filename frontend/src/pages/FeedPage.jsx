import { LogIn, LogOut, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { CommentSheet } from "../components/CommentSheet";
import { VideoCard } from "../components/VideoCard";
import { logout } from "../redux/authSlice";

export function FeedPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [videos, setVideos] = useState([]);
  const [activeComments, setActiveComments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/videos")
      .then(({ data }) => setVideos(data.videos))
      .catch(() => setError("Could not load videos"))
      .finally(() => setLoading(false));
  }, []);

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

      <div className="feed-track">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onComment={setActiveComments}
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
