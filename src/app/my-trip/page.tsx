"use client";

import { useEffect, useState, lazy, Suspense } from "react";
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

// Aggressive cleaning: keep only ASCII, newlines, tabs, and common emoji ranges
function cleanWeirdChars(text: string): string {
  // Allow: ASCII printable (space to ~), newline, tab, carriage return, and emoji ranges:
  // U+2600..U+26FF (misc symbols like ☀️, 🌤️, etc.), U+1F300..U+1F6FF (map, transport, warning)
  return text.replace(
    /[^\x20-\x7E\n\r\t\u{2600}-\u{26FF}\u{1F300}-\u{1F6FF}]/gu,
    "",
  );
}

function parseItinerary(raw: string) {
  const cleanRaw = cleanWeirdChars(raw);
  // Split into days (looking for "DAY 1:" etc.)
  const days = cleanRaw
    .split(/\n\s*DAY\s+\d+/i)
    .filter((block) => block.trim().length > 0);
  const result: {
    title: string;
    blocks: { type: string; content: string }[];
  }[] = [];

  for (let i = 0; i < days.length; i++) {
    const dayNum = i + 1;
    const lines = days[i].split("\n").filter((l) => l.trim().length > 0);
    const dayTitle = `Day ${dayNum}`;
    const blocks: { type: string; content: string }[] = [];

    for (let line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes("morning") || line.includes("☀️")) {
        blocks.push({
          type: "morning",
          content: line.replace(/^(☀️\s*Morning|Morning)\s*/, "").trim(),
        });
      } else if (lower.includes("afternoon") || line.includes("🌤️")) {
        blocks.push({
          type: "afternoon",
          content: line.replace(/^(🌤️\s*Afternoon|Afternoon)\s*/, "").trim(),
        });
      } else if (lower.includes("evening") || line.includes("🌙")) {
        blocks.push({
          type: "evening",
          content: line.replace(/^(🌙\s*Evening|Evening)\s*/, "").trim(),
        });
      } else if (
        lower.includes("walk") ||
        lower.includes("take the") ||
        lower.includes("min ride") ||
        lower.includes("🚶") ||
        lower.includes("🚆")
      ) {
        blocks.push({ type: "transport", content: line.trim() });
      } else if (lower.includes("safety tip")) {
        blocks.push({
          type: "safety",
          content: line.replace(/^⚠️\s*Safety tip:\s*/i, "").trim(),
        });
      } else if (line.trim().length > 0) {
        blocks.push({ type: "text", content: line.trim() });
      }
    }
    result.push({ title: dayTitle, blocks });
  }
  return result;
}

function renderBlock(block: { type: string; content: string }) {
  const linkify = (text: string) => {
    const instaRegex = /(https?:\/\/[^\s]*instagram\.com\/[^\s]+)/gi;
    const mapRegex =
      /(https?:\/\/[^\s]*google\.com\/maps\/[^\s]+|https?:\/\/[^\s]*maps\.google\.com\/[^\s]+)/gi;
    let result = text;
    result = result.replace(
      instaRegex,
      (match) =>
        `<a href="${match}" target="_blank" rel="noopener noreferrer" class="itinerary-link">📸 Instagram post</a>`,
    );
    result = result.replace(
      mapRegex,
      (match) =>
        `<a href="${match}" target="_blank" rel="noopener noreferrer" class="itinerary-link">🗺️ Map link</a>`,
    );
    return result;
  };

  const contentHtml = linkify(block.content);
  switch (block.type) {
    case "morning":
      return (
        <div className="it-block morning">
          <span className="it-icon">☀️</span>
          <span
            className="it-text"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      );
    case "afternoon":
      return (
        <div className="it-block afternoon">
          <span className="it-icon">🌤️</span>
          <span
            className="it-text"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      );
    case "evening":
      return (
        <div className="it-block evening">
          <span className="it-icon">🌙</span>
          <span
            className="it-text"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      );
    case "transport":
      return (
        <div className="it-transport">
          <span className="it-icon">🚶‍♂️</span>
          <span
            className="it-text"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      );
    case "safety":
      return (
        <div className="it-safety">
          <span className="it-icon">⚠️</span>
          <span
            className="it-text"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      );
    default:
      return (
        <div
          className="it-text-only"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      );
  }
}

export default function MyTripPage() {
  const pathname = usePathname();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [itinerary, setItinerary] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [parsedDays, setParsedDays] = useState<
    { title: string; blocks: any[] }[]
  >([]);

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
    setParsedDays(parseItinerary(result));
    setGenerating(false);
  };

  const copyItinerary = () => {
    if (itinerary) {
      const plain = itinerary
        .replace(/\*/g, "")
        .replace(/(https?:\/\/[^\s]+)/g, (url) => url);
      navigator.clipboard.writeText(plain);
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

        {/* Safety banner */}
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

        {/* Map & stats */}
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
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {generating ? (
                  <>⏳ Planning...</>
                ) : (
                  <>✨ Generate AI Itinerary</>
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
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  📋 Copy
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Itinerary cards */}
        {parsedDays.length > 0 && (
          <div className="itinerary-cards">
            {parsedDays.map((day, idx) => (
              <div key={idx} className="it-day-card">
                <div className="it-day-header">📅 {day.title}</div>
                <div className="it-day-content">
                  {day.blocks.map((block, i) => renderBlock(block))}
                </div>
              </div>
            ))}
            <div className="it-footer">✨ Powered by Groq AI | Gojee</div>
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
        .itinerary-cards { display: flex; flex-direction: column; gap: 1.5rem; }
        .it-day-card { background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 6px 28px rgba(61,44,39,0.06); }
        .it-day-header { background: #ffb38e; color: #3d2c27; padding: 0.75rem 1.25rem; font-weight: 800; font-size: 1.2rem; }
        .it-day-content { padding: 1.25rem; }
        .it-block, .it-transport, .it-safety { display: flex; gap: 0.75rem; margin-bottom: 1rem; align-items: flex-start; }
        .it-icon { font-size: 1.4rem; min-width: 2rem; text-align: center; }
        .it-text { flex: 1; line-height: 1.5; color: #1a1c1b; }
        .it-transport { background: #f4f3f1; padding: 0.75rem; border-radius: 16px; margin: 0.75rem 0; }
        .it-safety { background: #fff3e0; padding: 0.75rem; border-radius: 16px; margin-top: 0.5rem; }
        .it-text-only { margin: 0.75rem 0; line-height: 1.5; }
        .itinerary-link { color: #ff5a26; text-decoration: underline; margin-left: 0.25rem; }
        .it-footer { text-align: center; font-size: 0.7rem; color: #8f7067; margin-top: 0.75rem; }
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
