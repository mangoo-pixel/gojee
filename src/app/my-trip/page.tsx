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

// Determine time of day based on spot name keywords
function suggestTimeOfDay(spotName: string | null): string {
  const name = (spotName || "").toLowerCase();
  if (
    name.includes("cafe") ||
    name.includes("coffee") ||
    name.includes("breakfast")
  )
    return "☀️ Morning";
  if (
    name.includes("lunch") ||
    name.includes("bistro") ||
    name.includes("restaurant")
  )
    return "🌤️ Afternoon";
  if (
    name.includes("bar") ||
    name.includes("izakaya") ||
    name.includes("dinner")
  )
    return "🌙 Evening";
  if (
    name.includes("view") ||
    name.includes("observatory") ||
    name.includes("sunset")
  )
    return "🌇 Late afternoon";
  return "🕒 Flexible";
}

// Haversine distance in km
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
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatWalkingTime(distKm: number): string {
  if (distKm === 0) return "very close";
  const minutes = Math.round((distKm / 5) * 60);
  if (minutes < 1) return "very close";
  if (minutes < 60) return `${minutes} min walk`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function renderSpot(
  spot: Trip,
  idx: number,
  total: number,
  distToNext?: string,
) {
  return (
    <div key={spot.id} className="it-spot-item">
      <div className="it-spot-name">{spot.name || "Unnamed spot"}</div>
      <div className="it-spot-details">
        <span className="it-spot-time">{suggestTimeOfDay(spot.name)}</span>
        <div className="it-spot-links">
          <a
            href={spot.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="itinerary-link"
          >
            📸 Instagram
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name || "" + (spot.city ? `, ${spot.city}` : spot.country ? `, ${spot.country}` : ""))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="itinerary-link"
          >
            🗺️ Map
          </a>
        </div>
      </div>
      {distToNext && idx < total - 1 && (
        <div className="it-walk-info">🚶‍♂️ Next: {distToNext}</div>
      )}
    </div>
  );
}

export default function MyTripPage() {
  const pathname = usePathname();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Group spots by city (fallback to country)
  const grouped: Record<string, Trip[]> = {};
  for (const trip of trips) {
    let location = trip.city?.trim();
    if (!location) location = trip.country?.trim();
    if (!location) location = "Other";
    if (!grouped[location]) grouped[location] = [];
    grouped[location].push(trip);
  }

  // Pre‑compute walking distances between consecutive spots within each group
  const walkingInfo: Record<string, string[]> = {};
  for (const [location, locationSpots] of Object.entries(grouped)) {
    const distances: string[] = [];
    for (let i = 0; i < locationSpots.length - 1; i++) {
      const a = locationSpots[i];
      const b = locationSpots[i + 1];
      if (a.latitude && a.longitude && b.latitude && b.longitude) {
        const dist = getDistance(
          a.latitude,
          a.longitude,
          b.latitude,
          b.longitude,
        );
        distances.push(formatWalkingTime(dist));
      } else {
        distances.push("unknown");
      }
    }
    walkingInfo[location] = distances;
  }

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
          <span className="s-count-badge">✈️ Your spots, organised</span>
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

        <div
          className="s-card"
          style={{ padding: "1rem", marginBottom: "1.5rem" }}
        >
          <div style={{ fontWeight: 600 }}>📍 Saved spots</div>
          <div
            style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ff5a26" }}
          >
            {trips.length}
          </div>
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
            <p>Go to Home and save Instagram links – we’ll help you plan.</p>
            <a href="/" className="s-empty-link">
              Save your first spot
            </a>
          </div>
        )}

        {Object.entries(grouped).map(([location, locationSpots], dayIdx) => (
          <div
            key={location}
            className="it-day-card"
            style={{ marginBottom: "1.5rem" }}
          >
            <div className="it-day-header">
              📅 Day {dayIdx + 1}: {location}
            </div>
            <div className="it-day-content">
              {locationSpots.map((spot, idx) => {
                const distToNext = walkingInfo[location]?.[idx];
                return renderSpot(spot, idx, locationSpots.length, distToNext);
              })}
            </div>
          </div>
        ))}
        <div style={{ height: "5rem" }} />
      </div>

      <style>{`
        .it-day-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 6px 28px rgba(61,44,39,0.06);
          margin-bottom: 1.5rem;
        }
        .it-day-header {
          background: #ffb38e;
          color: #3d2c27;
          padding: 0.75rem 1.25rem;
          font-weight: 800;
          font-size: 1.2rem;
        }
        .it-day-content {
          padding: 1.25rem;
        }
        .it-spot-item {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e3e2e0;
        }
        .it-spot-item:last-child {
          border-bottom: none;
        }
        .it-spot-name {
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }
        .it-spot-details {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #8f7067;
        }
        .it-spot-time {
          background: #f0eeec;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
        }
        .it-spot-links {
          display: flex;
          gap: 0.75rem;
        }
        .itinerary-link {
          color: #ff5a26;
          text-decoration: underline;
        }
        .it-walk-info {
          font-size: 0.75rem;
          color: #8f7067;
          margin-top: 0.25rem;
          padding-left: 0.5rem;
          border-left: 2px solid #ffb38e;
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
