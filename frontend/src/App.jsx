import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { FeedPage } from "./pages/FeedPage";
import { NewVideoPage } from "./pages/NewVideoPage";
import { fetchMe } from "./redux/authSlice";

function getAuthStartPath() {
  return localStorage.getItem("hasRegistered") === "true" ? "/login" : "/register";
}

function AuthStartRedirect() {
  const { user, token } = useSelector((state) => state.auth);

  if (token && user) {
    return <Navigate to="/feed" replace />;
  }

  return <Navigate to={getAuthStartPath()} replace />;
}

function ProtectedRoute({ children }) {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to={getAuthStartPath()} replace />;
  }

  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    }
  }, [dispatch, token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthStartRedirect />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new"
          element={
            <ProtectedRoute>
              <NewVideoPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<AuthStartRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
