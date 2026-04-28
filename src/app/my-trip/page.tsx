"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { generateItinerary } from "@/app/actions/generate-itinerary";
import "@/app/trips/trips2.css";

type Trip = {
  id: string;
  name: string | null;
  instagram_url: string;
  created_at: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
};

// --- Cleaning & parsing (same as before) ---
function cleanWeirdChars(text: string): string {
  return text.replace(
    /[^\x20-\x7E\n\r\t\u{2600}-\u{26FF}\u{1F300}-\u{1F6FF}]/gu,
    "",
  );
}

function parseItinerary(raw: string) {
  const cleanRaw = cleanWeirdChars(raw);
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
      } else if (lower.includes("hidden gem")) {
        blocks.push({
          type: "hidden",
          content: line.replace(/^💎\s*Hidden gem:\s*/i, "").trim(),
        });
      } else if (lower.includes("budget tip")) {
        blocks.push({
          type: "budget",
          content: line.replace(/^💰\s*Budget tip:\s*/i, "").trim(),
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
  const icon = (() => {
    switch (block.type) {
      case "morning":
        return "☀️";
      case "afternoon":
        return "🌤️";
      case "evening":
        return "🌙";
      case "transport":
        return "🚶‍♂️";
      case "safety":
        return "⚠️";
      case "hidden":
        return "💎";
      case "budget":
        return "💰";
      default:
        return "📌";
    }
  })();

  return (
    <div className={`it-${block.type}`}>
      <span className="it-icon">{icon}</span>
      <span
        className="it-text"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}

export default function MyTripPage() {
  const pathname = usePathname();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [parsedDays, setParsedDays] = useState<
    { title: string; blocks: any[] }[]
  >([]);
  const [showSavedNote, setShowSavedNote] = useState(false);

  // Load saved from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gojee_itinerary");
    if (saved) {
      setItinerary(saved);
      setParsedDays(parseItinerary(saved));
      setShowSavedNote(true);
    }
  }, []);

  // Fetch trips
  useEffect(() => {
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

  const handleGenerate = async () => {
    setGenerating(true);
    const result = await generateItinerary(trips);
    setItinerary(result);
    setParsedDays(parseItinerary(result));
    localStorage.setItem("gojee_itinerary", result);
    setShowSavedNote(false);
    setGenerating(false);
  };

  const clearItinerary = () => {
    if (confirm("Delete the saved itinerary? You can generate a new one.")) {
      localStorage.removeItem("gojee_itinerary");
      setItinerary("");
      setParsedDays([]);
      setShowSavedNote(false);
    }
  };

  const shareItinerary = () => {
    if (!itinerary) return;
    const text = itinerary
      .replace(/(https?:\/\/[^\s]+)/g, "")
      .substring(0, 2000);
    if (navigator.share) {
      navigator.share({ title: "My Gojee Trip Plan", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Itinerary copied to clipboard!");
    }
  };

  const printItinerary = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const style = `
      <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
        .day-card { margin-bottom: 2rem; border-left: 4px solid #ff5a26; padding-left: 1rem; }
        .day-title { font-size: 1.5rem; font-weight: bold; color: #ff5a26; }
        .block { margin: 1rem 0; }
        .icon { font-size: 1.2rem; margin-right: 0.5rem; }
      </style>
    `;
    const content = `
      <html><head><title>My Gojee Trip</title>${style}</head><body>
      <h1>✈️ My Trip Itinerary</h1>
      ${parsedDays
        .map(
          (day) => `
        <div class="day-card">
          <div class="day-title">📅 ${day.title}</div>
          ${day.blocks.map((block) => `<div class="block"><span class="icon">${block.type === "morning" ? "☀️" : block.type === "afternoon" ? "🌤️" : block.type === "evening" ? "🌙" : block.type === "safety" ? "⚠️" : block.type === "hidden" ? "💎" : block.type === "budget" ? "💰" : "📌"}</span> ${block.content}</div>`).join("")}
        </div>
      `,
        )
        .join("")}
      <p><small>Powered by Gojee</small></p>
      </body></html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
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

        {/* Safety banner (optional, kept for solo traveller) */}
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

        {/* Stats and buttons (without map) */}
        <div
          className="s-card"
          style={{
            padding: "1rem",
            marginBottom: "1.5rem",
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
              style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ff5a26" }}
            >
              {trips.length}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>🗺️ Countries</div>
            <div
              style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ff5a26" }}
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
              {generating ? "⏳ Planning..." : "✨ Generate AI Itinerary"}
            </button>
            {itinerary && (
              <>
                <button
                  onClick={shareItinerary}
                  className="s-maps-btn"
                  style={{
                    background: "#e3e2e0",
                    color: "#ff5a26",
                    padding: "0.5rem 1rem",
                  }}
                >
                  📤 Share
                </button>
                <button
                  onClick={printItinerary}
                  className="s-maps-btn"
                  style={{
                    background: "#e3e2e0",
                    color: "#ff5a26",
                    padding: "0.5rem 1rem",
                  }}
                >
                  🖨️ Print
                </button>
                <button
                  onClick={clearItinerary}
                  className="s-maps-btn"
                  style={{
                    background: "#e3e2e0",
                    color: "#ff5a26",
                    padding: "0.5rem 1rem",
                  }}
                >
                  🗑️ Clear
                </button>
              </>
            )}
          </div>
        </div>

        {showSavedNote && (
          <div
            className="s-search"
            style={{
              backgroundColor: "#f0eeec",
              borderRadius: "16px",
              padding: "0.75rem",
              marginBottom: "1rem",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            📌 Showing previously generated itinerary. Click{" "}
            <strong>Generate AI Itinerary</strong> to refresh based on your
            latest saved spots.
          </div>
        )}

        {parsedDays.length > 0 && (
          <>
            <div className="it-note">
              💡 Tip: For any suggested hidden gem or budget spot, you can
              long‑press the text and choose “Search with Google” to find it on
              the map.
            </div>
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
          </>
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
        .it-block, .it-transport, .it-safety, .it-hidden, .it-budget { display: flex; gap: 0.75rem; margin-bottom: 1rem; align-items: flex-start; }
        .it-icon { font-size: 1.4rem; min-width: 2rem; text-align: center; }
        .it-text { flex: 1; line-height: 1.5; color: #1a1c1b; }
        .it-transport { background: #f4f3f1; padding: 0.75rem; border-radius: 16px; margin: 0.75rem 0; }
        .it-safety { background: #fff3e0; padding: 0.75rem; border-radius: 16px; margin-top: 0.5rem; }
        .it-hidden { background: #e6f4ea; padding: 0.75rem; border-radius: 16px; margin-top: 0.5rem; }
        .it-budget { background: #e3f2fd; padding: 0.75rem; border-radius: 16px; margin-top: 0.5rem; }
        .it-text-only { margin: 0.75rem 0; line-height: 1.5; }
        .itinerary-link { color: #ff5a26; text-decoration: underline; margin-left: 0.25rem; }
        .it-footer { text-align: center; font-size: 0.7rem; color: #8f7067; margin-top: 0.75rem; }
        .it-note { font-size: 0.75rem; text-align: center; margin-bottom: 1rem; color: #8f7067; background: #f0eeec; padding: 0.5rem; border-radius: 16px; }
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
