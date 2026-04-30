"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { saveTrip } from "../actions";
import "../trips/trips2.css";

export default function HomePage() {
  const pathname = usePathname();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showChinaWarning, setShowChinaWarning] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const extractFromInstagramUrl = (url: string): string | null => {
    const match = url.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/);
    if (match) return `Instagram post: ${match[1]}`;
    const userMatch = url.match(/instagram\.com\/([A-Za-z0-9_.]+)/);
    if (userMatch) return `@${userMatch[1]}'s post`;
    return null;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (!name && newUrl.includes("instagram.com")) {
      const suggestedName = extractFromInstagramUrl(newUrl);
      if (suggestedName) setName(suggestedName);
    }
  };

  const handleCountryChange = (value: string) => {
    setCountry(value);
    setShowChinaWarning(value.toLowerCase() === "china");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setMessage({ text: "Instagram URL is required", type: "error" });
      return;
    }
    setMessage({ text: "", type: "" });
    startTransition(async () => {
      try {
        const result = await saveTrip(
          url,
          name || null,
          city || null,
          country || null,
        );
        if (result.success) {
          const now = new Date();
          setLastSaved(now);
          setToast({ show: true, message: "✨ Just saved! ✨" });
          setTimeout(() => setToast({ show: false, message: "" }), 3000);
          setUrl("");
          setName("");
          setCity("");
          setCountry("");
          setShowChinaWarning(false);
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
              className="material-symbols-outlined"
              style={{ fontSize: 22, color: "#ff5a26" }}
            >
              explore
            </span>
          </div>
          <span className="s-brand">Gojee</span>
        </div>
        <div className="s-topbar-right">
          <button className="s-icon-btn" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="s-icon-btn" aria-label="Settings">
            <span className="material-symbols-outlined">settings</span>
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
            <span className="s-search-icon material-symbols-outlined">
              link
            </span>
            <input
              type="url"
              placeholder="Instagram URL (required)"
              value={url}
              onChange={handleUrlChange}
              required
            />
          </div>
          <div className="s-search">
            <span className="s-search-icon material-symbols-outlined">
              place
            </span>
            <input
              type="text"
              placeholder="Real spot name – helps the map find it (e.g., 'Tokyo Tower')"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="s-search">
            <span className="s-search-icon material-symbols-outlined">
              location_city
            </span>
            <input
              type="text"
              placeholder="City (e.g., Tokyo, Kyoto) – helps group spots into days"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="s-search">
            <span className="s-search-icon material-symbols-outlined">
              flag
            </span>
            <input
              type="text"
              placeholder="Country (optional, but improves map accuracy)"
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
            />
          </div>

          {showChinaWarning && (
            <div
              style={{
                backgroundColor: "#fff3e0",
                borderRadius: "12px",
                padding: "0.75rem",
                fontSize: "13px",
                color: "#b02f00",
                border: "1px solid #ffb38e",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "16px",
                  verticalAlign: "middle",
                  marginRight: "6px",
                }}
              >
                info
              </span>
              ⚠️ Gojee may be partially blocked inside China. We recommend
              planning your trip before departure.
            </div>
          )}

          <button type="submit" className="s-maps-btn" disabled={isPending}>
            {isPending ? "Saving..." : "Save spot"}
          </button>
          {message.text && message.type !== "success" && (
            <div
              style={{ textAlign: "center", marginTop: "0.5rem", color: "red" }}
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

      {/* Toast notification – prominent orange bar */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            left: "16px",
            right: "16px",
            backgroundColor: "#ff5a26",
            color: "white",
            padding: "12px",
            borderRadius: "40px",
            textAlign: "center",
            fontWeight: "bold",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          ✅ {toast.message}
        </div>
      )}

      <nav className="s-nav">
        <a
          href="/home"
          className={`s-nav-item ${pathname === "/home" ? "active" : ""}`}
        >
          <span className="s-nav-icon">🏠</span>
          <span>Home</span>
        </a>
        <a
          href="/trips"
          className={`s-nav-item ${pathname === "/trips" ? "active" : ""}`}
        >
          <span className="s-nav-icon">🔖</span>
          <span>Saved</span>
        </a>
        <a
          href="/my-trip"
          className={`s-nav-item ${pathname === "/my-trip" ? "active" : ""}`}
        >
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
