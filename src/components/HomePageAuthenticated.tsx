"use client";

import { useState, useTransition } from "react";
import { saveTrip } from "@/app/actions";
import { logout } from "@/app/actions/auth";
import "@/app/trips/trips2.css"; // ✅ absolute path

export default function HomePageAuthenticated() {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setMessage({ text: "Instagram URL is required", type: "error" });
      return;
    }

    setMessage({ text: "", type: "" });

    startTransition(async () => {
      try {
        const result = await saveTrip(url, name || null, country || null);
        if (result.success) {
          const now = new Date();
          setLastSaved(now);
          setMessage({ text: "✨ Just saved! ✨", type: "success" });
          setUrl("");
          setName("");
          setCountry("");
          setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        } else {
          throw new Error("Save failed");
        }
      } catch (err) {
        console.error(err);
        setMessage({ text: "❌ Failed to save. Try again.", type: "error" });
      }
    });
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    return `${Math.floor(minutes / 60)} hour(s) ago`;
  };

  return (
    <div className="s-app">
      <div className="s-topbar">
        <div className="s-topbar-left">
          <div className="s-avatar">
            <span
              style={{
                fontFamily: "Material Symbols Outlined",
                fontSize: 22,
                color: "#ff5a26",
              }}
            >
              explore
            </span>
          </div>
          <span className="s-brand">Gojee</span>
        </div>
        <div className="s-topbar-right">
          <button className="s-icon-btn" aria-label="Notifications">
            notifications
          </button>
          <button className="s-icon-btn" aria-label="Settings">
            settings
          </button>
          <button
            className="s-icon-btn"
            onClick={() => logout()}
            aria-label="Logout"
          >
            logout
          </button>
        </div>
      </div>

      <div className="s-content">
        <div className="s-hero">
          <h1>Save a new spot</h1>
          <span className="s-count-badge">from Instagram</span>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div className="s-search">
            <span className="s-search-icon">link</span>
            <input
              type="url"
              placeholder="Instagram URL (required)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="s-search">
            <span className="s-search-icon">place</span>
            <input
              type="text"
              placeholder="Spot name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="s-search">
            <span className="s-search-icon">flag</span>
            <input
              type="text"
              placeholder="Country (optional)"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <button type="submit" className="s-maps-btn" disabled={isPending}>
            {isPending ? "Saving..." : "Save spot"}
          </button>

          {message.text && (
            <div
              style={{
                textAlign: "center",
                marginTop: "0.5rem",
                color: message.type === "success" ? "green" : "red",
              }}
            >
              {message.text}
            </div>
          )}

          {lastSaved && (
            <div
              style={{
                textAlign: "center",
                marginTop: "0.5rem",
                fontSize: "12px",
                color: "#666",
              }}
            >
              🕒 Last saved: {getTimeAgo(lastSaved)}
            </div>
          )}
        </form>
      </div>

      <nav className="s-nav">
        <a href="/" className="s-nav-item active">
          <span className="s-nav-icon">home</span>Home
        </a>
        <a href="/trips" className="s-nav-item">
          <span className="s-nav-icon">bookmark</span>Saved
        </a>
        <a href="/explore" className="s-nav-item">
          <span className="s-nav-icon">explore</span>Explore
        </a>
        <a href="/safe-help" className="s-nav-item">
          <span className="s-nav-icon">shield_heart</span>Safety
        </a>
        <a href="/profile" className="s-nav-item">
          <span className="s-nav-icon">person</span>Profile
        </a>
      </nav>
    </div>
  );
}
