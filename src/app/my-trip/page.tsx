"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { usePathname } from "next/navigation";
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

// Helper: suggest time of day
function suggestTimeOfDay(spotName: string | null): string {
  const name = (spotName || "").toLowerCase();
  if (
    name.includes("cafe") ||
    name.includes("coffee") ||
    name.includes("breakfast")
  )
    return "🌅 Morning";
  if (
    name.includes("lunch") ||
    name.includes("bistro") ||
    name.includes("restaurant")
  )
    return "☀️ Midday";
  if (
    name.includes("view") ||
    name.includes("observatory") ||
    name.includes("sunset")
  )
    return "🌇 Afternoon";
  if (
    name.includes("bar") ||
    name.includes("izakaya") ||
    name.includes("dinner")
  )
    return "🌙 Evening";
  return "🕒 Flexible";
}

// Mock AI tip (short version for itinerary)
function getShortTip(spotName: string | null, country: string | null): string {
  if (country?.toLowerCase() === "japan") {
    const tips = [
      "Try the local matcha",
      "Visit early to avoid crowds",
      "Ask for the secret menu",
      "Great for solo photos",
    ];
    return tips[(spotName?.length || 0) % tips.length];
  }
  return "Local favourite";
}

export default function MyTripPage() {
  const pathname = usePathname();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [visited, setVisited] = useState<Record<string, boolean>>({});

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

  // Group spots by country for days
  const groupedByCountry = trips.reduce(
    (acc, trip) => {
      const country = trip.country?.trim() || "Other";
      if (!acc[country]) acc[country] = [];
      acc[country].push(trip);
      return acc;
    },
    {} as Record<string, Trip[]>,
  );

  // Flatten spots for reordering
  const allSpots = trips;

  // Sort spots by proximity (simple greedy)
  const reorderByRoute = () => {
    const withCoords = allSpots.filter((s) => s.latitude && s.longitude);
    if (withCoords.length < 2) return;
    const sorted = [...withCoords];
    // Greedy nearest neighbour (start from first)
    for (let i = 0; i < sorted.length - 1; i++) {
      let minDist = Infinity;
      let minIdx = i + 1;
      for (let j = i + 1; j < sorted.length; j++) {
        const dist = Math.hypot(
          sorted[i].latitude! - sorted[j].latitude!,
          sorted[i].longitude! - sorted[j].longitude!,
        );
        if (dist < minDist) {
          minDist = dist;
          minIdx = j;
        }
      }
      [sorted[i + 1], sorted[minIdx]] = [sorted[minIdx], sorted[i + 1]];
    }
    // Reorder the main trips array (simplistic: just update state)
    setTrips(sorted);
  };

  const toggleVisited = (id: string) => {
    setVisited((prev) => ({ ...prev, [id]: !prev[id] }));
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
          <span className="s-count-badge">✈️ Smart itinerary</span>
        </div>

        {/* Safety banner (compact) */}
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

        {/* Map */}
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

        {/* Route planner button */}
        {allSpots.length > 1 && (
          <button
            onClick={reorderByRoute}
            className="s-maps-btn"
            style={{
              marginBottom: "1rem",
              background: "#ffb38e",
              color: "#3d2c27",
            }}
          >
            🔄 Reorder by route (nearest first)
          </button>
        )}

        {/* Itinerary timeline */}
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
        {!loading && !error && allSpots.length === 0 && (
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
        {!loading && !error && allSpots.length > 0 && (
          <div className="itinerary-timeline">
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
              }}
            >
              📅 Your trip plan
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {allSpots.map((spot, idx) => {
                const timeSlot = suggestTimeOfDay(spot.name);
                return (
                  <div
                    key={spot.id}
                    className="s-card"
                    style={{ padding: "0.75rem" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!visited[spot.id]}
                        onChange={() => toggleVisited(spot.id)}
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "1rem" }}>
                          {spot.name ? spot.name.trim() : "Unnamed spot"}
                          {spot.country && (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                color: "#8f7067",
                                marginLeft: "0.5rem",
                              }}
                            >
                              {spot.country}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#8f7067",
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "center",
                            marginTop: "0.25rem",
                          }}
                        >
                          <span>⏰ {timeSlot}</span>
                          <span>•</span>
                          <span>💡 {getShortTip(spot.name, spot.country)}</span>
                        </div>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name || spot.instagram_url)}${spot.country ? `, ${spot.country}` : ""}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="s-maps-btn"
                        style={{
                          padding: "0.25rem 0.75rem",
                          fontSize: "0.7rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Map
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ height: "5rem" }} />
      </div>

      <nav className="s-nav">
        <a
          href="/"
          className={`s-nav-item ${pathname === "/" ? "active" : ""}`}
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
