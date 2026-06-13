import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { api } from "../api/client";

export function NewVideoPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    file_path: "/uploads/"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/videos", form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create video");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="form-page">
      <section className="form-panel">
        <Link className="back-link" to="/">
          <ArrowLeft size={18} />
          Back
        </Link>
        <h1>Add short</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
            />
          </label>
          <label>
            Category
            <input
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              required
            />
          </label>
          <label>
            File path
            <input
              value={form.file_path}
              onChange={(event) => setForm({ ...form, file_path: event.target.value })}
              required
            />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button className="primary-button" disabled={loading}>
            {loading ? "Saving..." : "Save video"}
          </button>
        </form>
      </section>
    </main>
  );
}
