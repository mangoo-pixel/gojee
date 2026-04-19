"use client";

import { useState } from "react";
import { loginWithGoogle, loginWithEmail } from "@/app/actions/auth";
import "@/app/trips/trips2.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("email", email);
    try {
      await loginWithEmail(formData);
      setMessage("Check your email for a magic link ✨");
    } catch (err) {
      setMessage("Failed to send link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="s-app">
      <div className="s-topbar">
        <div className="s-topbar-left">
          <div className="s-avatar">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 22, color: "#ff5a26" }}
            >
              explore
            </span>
          </div>
          <span className="s-brand">Gojee</span>
        </div>
        <div className="s-topbar-right"></div>
      </div>

      <div
        className="s-content"
        style={{ maxWidth: "400px", margin: "0 auto", paddingTop: "2rem" }}
      >
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            marginBottom: "0.5rem",
          }}
        >
          Welcome back
        </h1>
        <p style={{ color: "#8f7067", marginBottom: "2rem" }}>
          Sign in to access your saved spots and trip plans.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <form action={loginWithGoogle}>
            <button
              type="submit"
              className="s-maps-btn"
              style={{ background: "#ff5a26", color: "white", width: "100%" }}
            >
              Continue with Google
            </button>
          </form>

          <div style={{ textAlign: "center", color: "#8f7067" }}>or</div>

          <form onSubmit={handleEmailLogin}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "40px",
                border: "1px solid #e4beb4",
                marginBottom: "0.5rem",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="s-maps-btn"
              style={{ background: "#e3e2e0", color: "#ff5a26", width: "100%" }}
            >
              {loading ? "Sending..." : "Send magic link"}
            </button>
          </form>

          {message && (
            <p
              style={{
                textAlign: "center",
                color: "#b02f00",
                marginTop: "1rem",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>

      <nav className="s-nav">
        <a href="/" className="s-nav-item">
          <span className="s-nav-icon">🏠</span>
          <span>Home</span>
        </a>
        <a href="/trips" className="s-nav-item">
          <span className="s-nav-icon">🔖</span>
          <span>Saved</span>
        </a>
        <a href="/my-trip" className="s-nav-item">
          <span className="s-nav-icon">✈️</span>
          <span>My Trip</span>
        </a>
        <a href="/safe-help" className="s-nav-item">
          <span className="s-nav-icon">🛡️</span>
          <span>Safety</span>
        </a>
        <a href="/profile" className="s-nav-item">
          <span className="s-nav-icon">👤</span>
          <span>Profile</span>
        </a>
      </nav>
    </div>
  );
}
