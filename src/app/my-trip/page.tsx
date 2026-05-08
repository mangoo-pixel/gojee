"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "@/app/trips/trips2.css";

type Trip = {
  id: string;
  name: string | null;
  city: string | null;
  instagram_url: string;
  created_at: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
};

// List of major Japanese cities (extend as needed)
const cityKeywords = [
  "tokyo",
  "kyoto",
  "osaka",
  "yokohama",
  "nagoya",
  "sapporo",
  "fukuoka",
  "kobe",
  "nara",
  "hiroshima",
  "kanazawa",
  "nikko",
  "hakone",
  "kamakura",
];

function getSpotLocation(spot: Trip): string {
  if (spot.city?.trim()) return spot.city.trim();
  const name = spot.name?.toLowerCase() || "";
  for (const city of cityKeywords) {
    if (name.includes(city))
      return city.charAt(0).toUpperCase() + city.slice(1);
  }
  return spot.country?.trim() || "Other";
}

// Helper: get icon and time hint based on spot name
function getSpotMetadata(name: string | null) {
  const lowerName = (name || "").toLowerCase();
  if (
    lowerName.includes("cafe") ||
    lowerName.includes("coffee") ||
    lowerName.includes("matcha")
  )
    return { icon: "☕", timeHint: "🌅 Morning" };
  if (
    lowerName.includes("restaurant") ||
    lowerName.includes("bistro") ||
    lowerName.includes("izakaya")
  )
    return { icon: "🍽️", timeHint: "🌤️ Afternoon / Evening" };
  if (
    lowerName.includes("bar") ||
    lowerName.includes("brewery") ||
    lowerName.includes("pub")
  )
    return { icon: "🍺", timeHint: "🌙 Evening" };
  if (
    lowerName.includes("view") ||
    lowerName.includes("observatory") ||
    lowerName.includes("garden")
  )
    return { icon: "🏞️", timeHint: "🌅 Morning / 🌇 Sunset" };
  if (
    lowerName.includes("temple") ||
    lowerName.includes("shrine") ||
    lowerName.includes("museum")
  )
    return { icon: "🏛️", timeHint: "🌅 Morning" };
  return { icon: "📍", timeHint: "🕒 Flexible" };
}

// Fetch a safe AI tip for a single spot
async function fetchSpotTip(
  spotName: string,
  location: string,
): Promise<string> {
  const prompt = `Give a very short, helpful tip (max 15 words) for a solo traveller visiting "${spotName}" in ${location}. The tip can be about safety, a local custom, or something to try. Never mention prices, opening hours, walking times, or distances. Keep it positive and practical. Example: "Try the matcha latte – it's a local favourite."`;
  try {
    const res = await fetch("/api/ai-tip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    return data.tip || "✨ Ask a local for their favourite dish!";
  } catch (err) {
    console.error(err);
    return "✨ Look for the daily special!";
  }
}

export default function MyTripPage() {
  const pathname = usePathname();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tips, setTips] = useState<Record<string, string>>({});
  const [loadingTips, setLoadingTips] = useState<Record<string, boolean>>({});

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

  // Group by derived location (city or from name)
  const grouped: Record<string, Trip[]> = {};
  for (const trip of trips) {
    const location = getSpotLocation(trip);
    if (!grouped[location]) grouped[location] = [];
    grouped[location].push(trip);
  }

  const handleGetTip = async (
    spotId: string,
    spotName: string,
    location: string,
  ) => {
    if (tips[spotId] || loadingTips[spotId]) return;
    setLoadingTips((prev) => ({ ...prev, [spotId]: true }));
    const tip = await fetchSpotTip(spotName, location);
    setTips((prev) => ({ ...prev, [spotId]: tip }));
    setLoadingTips((prev) => ({ ...prev, [spotId]: false }));
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
          <span className="s-count-badge">
            ✈️ Your spots, organised by city
          </span>
        </div>

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

        {loading && (
          <div className="s-empty">
            <p>Loading your spots...</p>
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
              Go to Home and save Instagram links – we’ll group them by city.
            </p>
            <a href="/" className="s-empty-link">
              Save your first spot
            </a>
          </div>
        )}

        {Object.entries(grouped).map(([location, locationSpots]) => (
          <div
            key={location}
            className="s-card"
            style={{ marginBottom: "1.5rem" }}
          >
            <div
              style={{
                background: "#ffb38e",
                padding: "0.75rem 1.25rem",
                fontWeight: 800,
                fontSize: "1.2rem",
                borderRadius: "24px 24px 0 0",
                color: "#3d2c27",
              }}
            >
              📍 {location} ({locationSpots.length})
            </div>
            <div style={{ padding: "1rem" }}>
              {locationSpots.map((spot) => {
                const { icon, timeHint } = getSpotMetadata(spot.name);
                const tip = tips[spot.id];
                const isLoadingTip = loadingTips[spot.id];
                return (
                  <div
                    key={spot.id}
                    style={{
                      padding: "0.75rem 0",
                      borderBottom: "1px solid #e3e2e0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "1rem" }}>
                        <span style={{ marginRight: "0.5rem" }}>{icon}</span>
                        {spot.name || "Unnamed spot"}
                      </div>
                      <button
                        onClick={() =>
                          handleGetTip(
                            spot.id,
                            spot.name || "this spot",
                            location,
                          )
                        }
                        disabled={isLoadingTip || !!tip}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                          color: "#ff5a26",
                        }}
                        title="Get a friendly tip"
                      >
                        {isLoadingTip ? "⏳" : tip ? "✅" : "✨"}
                      </button>
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#8f7067",
                        marginTop: "0.25rem",
                        display: "flex",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>{timeHint}</span>
                      <a
                        href={spot.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#ff5a26",
                          textDecoration: "underline",
                        }}
                      >
                        📸 Instagram
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((spot.name || "") + (location !== "Other" ? `, ${location}` : ""))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#ff5a26",
                          textDecoration: "underline",
                        }}
                      >
                        🗺️ Map
                      </a>
                    </div>
                    {tip && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.5rem",
                          background: "#f0eeec",
                          borderRadius: "12px",
                          fontSize: "0.85rem",
                          color: "#3d2c27",
                        }}
                      >
                        💡 {tip}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ height: "5rem" }} />
      </div>

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
