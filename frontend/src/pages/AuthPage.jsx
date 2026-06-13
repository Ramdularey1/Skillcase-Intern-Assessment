import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { login, register } from "../redux/authSlice";

export function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const action = isRegister ? register : login;
    const payload = isRegister ? form : { email: form.email, password: form.password };
    const result = await dispatch(action(payload));

    if (result.meta.requestStatus === "fulfilled") {
      navigate(isRegister ? "/login" : "/feed", { replace: true });
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Skillcase Shorts</p>
          <h1>{isRegister ? "Create account" : "Welcome back"}</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
                minLength={2}
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
              minLength={isRegister ? 6 : 1}
            />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button className="primary-button" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </section>
    </main>
  );
}
