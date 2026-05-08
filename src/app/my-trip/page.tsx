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

  // Group trips by city (prefer city, fallback to country, then "Other")
  const grouped: Record<string, Trip[]> = {};
  for (const trip of trips) {
    let location = trip.city?.trim();
    if (!location) location = trip.country?.trim();
    if (!location) location = "Other";
    if (!grouped[location]) grouped[location] = [];
    grouped[location].push(trip);
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
          <span className="s-count-badge">✈️ Your spots by location</span>
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
              Go to Home and save Instagram links – we’ll group them by
              location.
            </p>
            <a href="/" className="s-empty-link">
              Save your first spot
            </a>
          </div>
        )}

        {Object.entries(grouped).map(([location, locationSpots], idx) => (
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
              {locationSpots.map((spot) => (
                <div
                  key={spot.id}
                  style={{
                    padding: "0.75rem 0",
                    borderBottom: "1px solid #e3e2e0",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                    {spot.name || "Unnamed spot"}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <a
                      href={spot.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#ff5a26", textDecoration: "underline" }}
                    >
                      📸 Instagram
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        (spot.name || "") +
                          (location !== "Other" ? `, ${location}` : ""),
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#ff5a26", textDecoration: "underline" }}
                    >
                      🗺️ Map
                    </a>
                  </div>
                </div>
              ))}
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
