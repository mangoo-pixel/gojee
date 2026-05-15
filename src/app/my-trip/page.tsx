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

export default function MyTripPage() {
  const pathname = usePathname();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderChanged, setOrderChanged] = useState(false);

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

        <div style={{ marginBottom: "1rem" }}>
          <button
            onClick={reorderByProximity}
            className="s-maps-btn"
            style={{
              background: "#ff5a26",
              color: "white",
              width: "100%",
              padding: "0.5rem",
            }}
          >
            🔄 Reorder by proximity (walking distance)
          </button>
          {orderChanged && (
            <p
              style={{
                fontSize: "0.7rem",
                marginTop: "0.25rem",
                textAlign: "center",
              }}
            >
              Order updated based on straight‑line distance.
            </p>
          )}
        </div>

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
