import React, { useEffect, useMemo, useState } from "react";
import AuthForm from "./AuthForm";
import { fetchCurrentUser } from "./api";
import "./App.css";

const SESSION_KEY = "fullstack-codex-lab-token";

const readTokenFromStorage = () => {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
};

const persistToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(SESSION_KEY, token);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    //
  }
};

function App() {
  const [token, setToken] = useState(() => readTokenFromStorage());
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!token) {
      setUser(null);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    fetchCurrentUser(token)
      .then((payload) => {
        const currentUser =
          payload?.user ??
          (payload?.userId ? { userId: payload.userId } : null);
        setUser(currentUser);
        setStatus("success");
      })
      .catch(() => {
        persistToken(null);
        setToken(null);
        setStatus("error");
      });
  }, [token]);

  const handleLoginSuccess = (data) => {
    setToken(data.token);
    persistToken(data.token);
    const profile =
      data.user ?? (data.userId ? { userId: data.userId } : null);
    setUser(profile);
    setStatus("success");
  };

  const handleLogout = () => {
    setToken(null);
    persistToken(null);
    setUser(null);
    setStatus("idle");
  };

  const statusMessage = useMemo(() => {
    if (status === "loading") {
      return "Checking your session...";
    }

    if (status === "error") {
      return "Session expired or invalid token. Please sign in again.";
    }

    if (user) {
      return `Signed in as ${user.userId}.`;
    }

    return "Sign in to continue working with the backend API.";
  }, [status, user]);

  const isAuthenticating = status === "loading";

  return (
    <div className="app-shell">
      <div className="app-panel">
        <header className="hero">
          <p className="eyebrow">Fullstack Codex Lab</p>
          <h1>Connect frontend & backend</h1>
          <p>
            Register a unique user ID, log in, and see how the JWT-backed
            endpoint reveals your profile.
          </p>
        </header>

        <section className="status-card">
          <p className="status-text">{statusMessage}</p>
          {status === "loading" && <div className="spinner" aria-hidden="true" />}
        </section>

        {user ? (
          <section className="profile-card">
            <div>
              <p className="label">User ID</p>
              <p className="value">{user.userId}</p>
            </div>
            <button type="button" className="action-button outline" onClick={handleLogout}>
              Log out
            </button>
          </section>
        ) : (
          <section className="auth-card">
            <h2>Authentication</h2>
            <p className="subtext">
              Create a new user ID or sign in with the seeded accounts. Once
              authenticated we keep the JWT in local storage and show the
              protected profile.
            </p>
            <AuthForm onSuccess={handleLoginSuccess} disabled={isAuthenticating} />
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
