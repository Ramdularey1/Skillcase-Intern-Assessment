import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";

export function CommentSheet({ open, video, onClose }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !video) {
      return;
    }

    setLoading(true);
    api
      .get(`/videos/${video.id}/comments`)
      .then(({ data }) => setComments(data.comments))
      .catch(() => setError("Could not load comments"))
      .finally(() => setLoading(false));
  }, [open, video]);

  async function submitComment(event) {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    try {
      const { data } = await api.post(`/videos/${video.id}/comment`, {
        content: content.trim()
      });
      setComments((current) => [data.comment, ...current]);
      setContent("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Login is required to comment");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.section
            className="comment-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
          >
            <div className="sheet-header">
              <h2>Comments</h2>
              <button className="icon-button" onClick={onClose} aria-label="Close comments">
                <X size={20} />
              </button>
            </div>

            <div className="comment-list">
              {loading && <p className="muted">Loading comments...</p>}
              {error && <p className="error-text">{error}</p>}
              {!loading && comments.length === 0 && <p className="muted">No comments yet.</p>}
              {comments.map((comment) => (
                <article className="comment" key={comment.id}>
                  <strong>{comment.user_name || "You"}</strong>
                  <p>{comment.content}</p>
                </article>
              ))}
            </div>

            <form className="comment-form" onSubmit={submitComment}>
              <input
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Add a comment"
              />
              <button className="icon-button accent" type="submit" aria-label="Post comment">
                <Send size={18} />
              </button>
            </form>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
