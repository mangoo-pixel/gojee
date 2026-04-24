"use client";

import { useEffect, useState, lazy, Suspense, useRef } from "react";
import { usePathname } from "next/navigation";
import { generateItinerary } from "@/app/actions/generate-itinerary";
import "@/app/trips/trips2.css";

const SpotMap = lazy(() => import("@/components/SpotMap"));

type Trip = {
  id: string;
  name: string | null;
  instagram_url: string;
  created_at: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
};

// Helper to parse markdown into days (simple split by "Day X")
function parseDays(markdown: string): { title: string; content: string }[] {
  const lines = markdown.split("\n");
  const days: { title: string; content: string }[] = [];
  let currentDay: { title: string; content: string } | null = null;
  for (const line of lines) {
    if (line.match(/^##\s+Day\s+\d+/i)) {
      if (currentDay) days.push(currentDay);
      currentDay = { title: line.replace(/^##\s+/, ""), content: "" };
    } else if (currentDay) {
      currentDay.content += line + "\n";
    }
  }
  if (currentDay) days.push(currentDay);
  return days;
}

// Format content lines: add icons for morning/afternoon/evening/safety
function formatContent(content: string) {
  const lines = content.split("\n");
  const formatted = lines
    .map((line, idx) => {
      const lower = line.toLowerCase();
      if (lower.includes("morning:"))
        return (
          <div key={idx} className="activity-item">
            <span className="activity-icon">☀️</span>
            <span className="activity-text">{line}</span>
          </div>
        );
      if (lower.includes("afternoon:"))
        return (
          <div key={idx} className="activity-item">
            <span className="activity-icon">🌤️</span>
            <span className="activity-text">{line}</span>
          </div>
        );
      if (lower.includes("evening:"))
        return (
          <div key={idx} className="activity-item">
            <span className="activity-icon">🌙</span>
            <span className="activity-text">{line}</span>
          </div>
        );
      if (lower.includes("safety tip:"))
        return (
          <div key={idx} className="safety-item">
            <span className="activity-icon">⚠️</span>
            <span className="activity-text">{line}</span>
          </div>
        );
      if (line.trim() === "") return null;
      return (
        <p key={idx} className="regular-text">
          {line}
        </p>
      );
    })
    .filter(Boolean);
  return <div className="activity-container">{formatted}</div>;
}

export default function MyTripPage() {
  const pathname = usePathname();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [itinerary, setItinerary] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [days, setDays] = useState<{ title: string; content: string }[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    const fetchTrips = async () => {
      try {
        const res = await fetch("/api/recent-trips?limit=100");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setTrips(data.trips || []);
      } catch (err) {
        setError("Could not load your saved spots.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const spotsWithCoords = trips
    .filter((t) => t.latitude && t.longitude)
    .map((t) => ({
      id: t.id,
      name: t.name,
      lat: t.latitude!,
      lng: t.longitude!,
    }));

  const handleGenerate = async () => {
    setGenerating(true);
    setItinerary("");
    const result = await generateItinerary(trips);
    setItinerary(result);
    setDays(parseDays(result));
    setGenerating(false);
  };

  const copyItinerary = () => {
    if (itinerary) {
      navigator.clipboard.writeText(itinerary);
      alert("Itinerary copied to clipboard!");
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
          <h1>My Trip</h1>
          <span className="s-count-badge">✈️ AI‑powered itinerary</span>
        </div>

        {/* Safety mini-banner */}
        <div
          className="s-search"
          style={{
            backgroundColor: "#ffe5df",
            borderRadius: "16px",
            padding: "0.75rem",
            marginBottom: "1rem",
            fontSize: "13px",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "18px" }}>🛡️</span>
            <span style={{ fontWeight: 600, color: "#b02f00" }}>
              Solo traveller safety
            </span>
          </div>
          <p
            style={{ fontSize: "12px", marginTop: "0.25rem", color: "#3d2c27" }}
          >
            Share live location, keep digital passport copy, avoid empty train
            cars late at night.
          </p>
        </div>

        {/* Map + stats + generate button */}
        <div style={{ marginBottom: "1.5rem" }}>
          {isClient && spotsWithCoords.length > 0 && (
            <Suspense
              fallback={
                <div
                  style={{
                    height: "300px",
                    background: "#f0eeec",
                    borderRadius: "24px",
                    marginBottom: "1rem",
                  }}
                />
              }
            >
              <SpotMap spots={spotsWithCoords} />
            </Suspense>
          )}
          <div
            className="s-card"
            style={{
              padding: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>📍 Saved spots</div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#ff5a26",
                }}
              >
                {trips.length}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>🗺️ Countries</div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#ff5a26",
                }}
              >
                {new Set(trips.map((t) => t.country).filter(Boolean)).size}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                onClick={handleGenerate}
                disabled={generating || trips.length === 0}
                className="s-maps-btn"
                style={{
                  background: "#ff5a26",
                  color: "white",
                  padding: "0.5rem 1rem",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {generating ? (
                  <>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "1.2rem",
                        animation: "spin 1s linear infinite",
                      }}
                    >
                      progress_activity
                    </span>
                    Planning...
                  </>
                ) : (
                  <>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1.2rem" }}
                    >
                      auto_awesome
                    </span>
                    Generate AI Itinerary
                  </>
                )}
              </button>
              {itinerary && (
                <button
                  onClick={copyItinerary}
                  className="s-maps-btn"
                  style={{
                    background: "#e3e2e0",
                    color: "#ff5a26",
                    padding: "0.5rem 1rem",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.2rem" }}
                  >
                    content_copy
                  </span>
                  Copy
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Itinerary Result – Rich Cards */}
        {itinerary && days.length > 0 && (
          <div ref={contentRef} className="itinerary-container">
            {days.map((day, idx) => (
              <div
                key={idx}
                className="itinerary-day-card"
                style={{ marginBottom: "1.5rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                    borderLeft: "4px solid #ff5a26",
                    paddingLeft: "0.75rem",
                  }}
                >
                  <span style={{ fontSize: "1.8rem" }}>📅</span>
                  <h3
                    style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}
                  >
                    {day.title}
                  </h3>
                </div>
                <div
                  className="s-card"
                  style={{
                    padding: "1rem",
                    background: "linear-gradient(145deg, #ffffff, #faf9f7)",
                    borderRadius: "20px",
                  }}
                >
                  {formatContent(day.content)}
                </div>
              </div>
            ))}
            {/* Small print */}
            <div
              style={{
                fontSize: "0.7rem",
                textAlign: "center",
                color: "#8f7067",
                marginTop: "1rem",
              }}
            >
              ✨ Powered by Groq AI | Gojee
            </div>
          </div>
        )}

        {!itinerary && !generating && trips.length > 0 && (
          <div
            className="s-card"
            style={{ padding: "1rem", textAlign: "center", color: "#8f7067" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "2rem", color: "#ff5a26" }}
            >
              auto_awesome
            </span>
            <p style={{ marginTop: "0.5rem" }}>
              Click “Generate AI Itinerary” to get a smart, day‑by‑day plan for
              your trip.
            </p>
          </div>
        )}

        {loading && (
          <div className="s-empty">
            <p>Planning your trip...</p>
          </div>
        )}
        {error && (
          <div className="s-empty">
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && trips.length === 0 && (
          <div className="s-empty">
            <span className="s-empty-icon">🗺️</span>
            <h2>No saved spots yet</h2>
            <p>
              Go to Home and save Instagram links – we’ll build your itinerary.
            </p>
            <a href="/" className="s-empty-link">
              Save your first spot
            </a>
          </div>
        )}
        <div style={{ height: "5rem" }} />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .activity-item, .safety-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .activity-icon {
          font-size: 1.25rem;
          min-width: 1.75rem;
        }
        .activity-text {
          flex: 1;
          line-height: 1.4;
        }
        .safety-item {
          background: #fff3e0;
          padding: 0.5rem;
          border-radius: 12px;
          margin-top: 0.5rem;
        }
        .regular-text {
          margin: 0.5rem 0;
          line-height: 1.5;
        }
        .itinerary-container {
          display: flex;
          flex-direction: column;
        }
      `}</style>

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
