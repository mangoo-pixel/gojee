"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
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

function getLocationKey(trip: Trip): string {
  return trip.city?.trim() || trip.country?.trim() || "Other";
}

function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(distKm: number): string {
  if (distKm < 0.1) return "very close";
  if (distKm < 1) return `${Math.round(distKm * 1000)} m`;
  return `${distKm.toFixed(1)} km`;
}

async function generateAIPlan(spots: Trip[]): Promise<string> {
  if (spots.length === 0)
    return "No spots saved yet. Go to Home and save some Instagram links.";
  const spotsList = spots
    .map(
      (s) =>
        `- ${s.name || "Unnamed spot"} (${s.city || s.country || "Unknown location"})`,
    )
    .join("\n");
  const prompt = `
You are Gojee, a solo‑travel planner. The user has saved these spots:
${spotsList}

Create a short, friendly day‑by‑day itinerary for a solo traveller. Group spots by city if possible.
NEVER mention prices, opening hours, walking times, or distances.
Use only ☀️ morning, 🌤️ afternoon, 🌙 evening.
Keep each day short (2-3 lines). Format as:

## Day 1: Tokyo
☀️ Morning: ...
🌤️ Afternoon: ...
🌙 Evening: ...
💡 Tip: (optional safety or local custom)
`;
  try {
    const res = await fetch("/api/ai-trip-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    return data.plan || "✨ Plan your trip by reordering spots below!";
  } catch {
    return "✨ Use the 'Reorder by proximity' button to plan your route.";
  }
}

export default function MyTripPage() {
  const pathname = usePathname();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [aiPlan, setAiPlan] = useState<string>("");
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    fetch("/api/recent-trips?limit=100")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setTrips(data.trips || []))
      .catch(() => setError("Could not load spots."))
      .finally(() => setLoading(false));
  }, []);

  const reorderByProximity = () => {
    if (trips.length < 2) return;
    const withCoords = trips.filter((t) => t.latitude && t.longitude);
    if (withCoords.length < 2) return;
    const sorted = [...withCoords];
    for (let i = 0; i < sorted.length - 1; i++) {
      let minIdx = i + 1;
      let minDist = getDistance(
        sorted[i].latitude!,
        sorted[i].longitude!,
        sorted[minIdx].latitude!,
        sorted[minIdx].longitude!,
      );
      for (let j = i + 2; j < sorted.length; j++) {
        const dist = getDistance(
          sorted[i].latitude!,
          sorted[i].longitude!,
          sorted[j].latitude!,
          sorted[j].longitude!,
        );
        if (dist < minDist) {
          minDist = dist;
          minIdx = j;
        }
      }
      [sorted[i + 1], sorted[minIdx]] = [sorted[minIdx], sorted[i + 1]];
    }
    setTrips(sorted);
    setOrderChanged(true);
  };

  const generateAIPlanHandler = async () => {
    setGeneratingPlan(true);
    const plan = await generateAIPlan(trips);
    setAiPlan(plan);
    setGeneratingPlan(false);
  };

  const groups: Record<string, Trip[]> = {};
  for (const trip of trips) {
    const key = getLocationKey(trip);
    if (!groups[key]) groups[key] = [];
    groups[key].push(trip);
  }

  if (loading)
    return (
      <div className="s-app">
        <div className="s-content">Loading...</div>
      </div>
    );
  if (error)
    return (
      <div className="s-app">
        <div className="s-content">{error}</div>
      </div>
    );
  if (trips.length === 0)
    return (
      <div className="s-app">
        <div className="s-content">
          <p>No saved spots yet. Go to Home to save.</p>
        </div>
      </div>
    );

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
          <span className="s-count-badge">✈️ Smart planner</span>
        </div>

        <div
          className="s-search"
          style={{
            backgroundColor: "#ffe5df",
            borderRadius: "16px",
            padding: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "18px" }}>🛡️</span>
            <span style={{ fontWeight: 600, color: "#b02f00" }}>
              Solo traveller safety
            </span>
          </div>
          <p style={{ fontSize: "12px" }}>
            Share live location, keep digital passport copy, avoid empty train
            cars late at night.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={reorderByProximity}
            className="s-maps-btn"
            style={{
              background: "#ff5a26",
              color: "white",
              padding: "0.5rem 1rem",
              flex: 1,
            }}
          >
            🔄 Reorder by proximity (walking distance)
          </button>
          <button
            onClick={generateAIPlanHandler}
            disabled={generatingPlan}
            className="s-maps-btn"
            style={{
              background: "#ffb38e",
              color: "#3d2c27",
              padding: "0.5rem 1rem",
              flex: 1,
            }}
          >
            {generatingPlan ? "⏳ Planning..." : "✨ Generate AI itinerary"}
          </button>
        </div>

        {orderChanged && (
          <p
            style={{
              fontSize: "0.7rem",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            Order updated based on straight‑line distance.
          </p>
        )}

        {/* AI Generated Itinerary */}
        {aiPlan && (
          <div
            className="s-card"
            style={{
              padding: "1rem",
              marginBottom: "1.5rem",
              background: "linear-gradient(145deg, #fff, #faf9f7)",
            }}
          >
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#ff5a26" }}
              >
                auto_awesome
              </span>
              AI‑suggested plan
            </h3>
            <div style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        marginTop: "1rem",
                        marginBottom: "0.5rem",
                        color: "#ff5a26",
                        borderLeft: "4px solid #ff5a26",
                        paddingLeft: "0.5rem",
                      }}
                    >
                      {children}
                    </h2>
                  ),
                  p: ({ children }) => (
                    <p style={{ margin: "0.5rem 0" }}>{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul style={{ paddingLeft: "1.5rem", margin: "0.5rem 0" }}>
                      {children}
                    </ul>
                  ),
                }}
              >
                {aiPlan}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Deterministic grouping with distances */}
        {Object.entries(groups).map(([location, locationSpots]) => (
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
              {locationSpots.map((spot, idx) => {
                const distanceToNext =
                  idx < locationSpots.length - 1 &&
                  spot.latitude &&
                  spot.longitude &&
                  locationSpots[idx + 1].latitude &&
                  locationSpots[idx + 1].longitude
                    ? formatDistance(
                        getDistance(
                          spot.latitude,
                          spot.longitude,
                          locationSpots[idx + 1].latitude!,
                          locationSpots[idx + 1].longitude!,
                        ),
                      )
                    : null;
                return (
                  <div
                    key={spot.id}
                    style={{
                      padding: "0.75rem 0",
                      borderBottom:
                        idx < locationSpots.length - 1
                          ? "1px solid #e3e2e0"
                          : "none",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {spot.name || "Unnamed spot"}
                    </div>
                    {distanceToNext && (
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#8f7067",
                          marginTop: "0.25rem",
                        }}
                      >
                        🚶‍♂️ Next: {distanceToNext}
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
