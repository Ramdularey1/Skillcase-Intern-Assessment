import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";

export function CommentSheet({ open, video, onClose }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !video) {
      return;
    }

    setReplyTo(null);
    setContent("");
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
        content: content.trim(),
        parent_id: replyTo?.id || null
      });

      const newComment = { ...data.comment, user_name: "You", replies: [] };
      setComments((current) => {
        if (!replyTo) {
          return [newComment, ...current];
        }

        return current.map((comment) =>
          comment.id === replyTo.id
            ? { ...comment, replies: [...(comment.replies || []), newComment] }
            : comment
        );
      });
      setContent("");
      setReplyTo(null);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Login is required to comment");
    }
  }

  function getInitial(name) {
    return name?.charAt(0)?.toUpperCase() || "U";
  }

  function renderComment(comment, nested = false) {
    return (
      <article className={nested ? "comment reply-comment" : "comment"} key={comment.id}>
        <div className="comment-avatar">{getInitial(comment.user_name || "You")}</div>
        <div className="comment-body">
          <div className="comment-meta">
            <strong>{comment.user_name || "You"}</strong>
            {nested && <span>Reply</span>}
          </div>
          <p>{comment.content}</p>
          {!nested && (
            <button className="reply-button" onClick={() => setReplyTo(comment)} type="button">
              Reply
            </button>
          )}
          {(comment.replies || []).length > 0 && (
            <div className="reply-list">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.section
            className="comment-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-header">
              <div><h2>Comments</h2><span>{comments.length} threads</span></div>
              <button className="icon-button" onClick={onClose} aria-label="Close comments">
                <X size={20} />
              </button>
            </div>

            <div className="comment-list">
              {loading && <p className="muted">Loading comments...</p>}
              {error && <p className="error-text">{error}</p>}
              {!loading && comments.length === 0 && <p className="muted">No comments yet.</p>}
              {comments.map((comment) => renderComment(comment))}
            </div>

            <form className="comment-form" onSubmit={submitComment}>
              {replyTo && (
                <div className="replying-to">
                  <span>Replying to {replyTo.user_name || "comment"}</span>
                  <button type="button" onClick={() => setReplyTo(null)}>Cancel</button>
                </div>
              )}
              <input
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={replyTo ? "Write a reply" : "Add a comment"}
              />
              <button className="icon-button accent" type="submit" aria-label="Post comment" disabled={!content.trim()}>
                <Send size={18} />
              </button>
            </form>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
