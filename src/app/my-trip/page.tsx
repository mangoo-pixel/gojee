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

function suggestTimeOfDay(spotName: string | null): string {
  const name = (spotName || "").toLowerCase();
  if (
    name.includes("cafe") ||
    name.includes("coffee") ||
    name.includes("breakfast")
  )
    return "🌅 Morning (8:00 – 10:30)";
  if (
    name.includes("lunch") ||
    name.includes("bistro") ||
    name.includes("restaurant")
  )
    return "☀️ Midday (12:00 – 14:00)";
  if (
    name.includes("view") ||
    name.includes("observatory") ||
    name.includes("sunset")
  )
    return "🌇 Afternoon / Sunset (15:00 – 18:00)";
  if (
    name.includes("bar") ||
    name.includes("izakaya") ||
    name.includes("dinner")
  )
    return "🌙 Evening (19:00 – 22:00)";
  return "🕒 Flexible – check opening hours";
}

function getAITip(spotName: string | null, country: string | null): string {
  if (country?.toLowerCase() === "japan") {
    const tips = [
      "💡 Pro tip: Learn a few Japanese phrases – 'Sumimasen' (excuse me) goes a long way.",
      "🍵 Local hack: Many temples offer free matcha and meditation sessions in the morning.",
      "🚆 Travel smart: Get a Suica or Pasmo card for easy train & convenience store payments.",
      "📸 Solo photo tip: Ask a local shopkeeper to take your picture – they're usually happy to help.",
      "🧳 Safety note: Keep your passport in your hotel safe; carry a photocopy instead.",
    ];
    const index = (spotName?.length || 0) % tips.length;
    return tips[index];
  }
  return "✨ Explore nearby hidden gems by asking local shop owners.";
}

export default function MyTripPage() {
  const pathname = usePathname();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

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

  const groupedByCountry = trips.reduce(
    (acc, trip) => {
      const country = trip.country?.trim() || "Other";
      if (!acc[country]) acc[country] = [];
      acc[country].push(trip);
      return acc;
    },
    {} as Record<string, Trip[]>,
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
          <span className="s-count-badge">✈️ AI‑powered itinerary</span>
        </div>

        <div
          className="s-search"
          style={{
            backgroundColor: "#ffe5df",
            borderRadius: "16px",
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "24px", color: "#ff5a26" }}
            >
              shield_heart
            </span>
            <span style={{ fontWeight: 600, color: "#b02f00" }}>
              Solo traveller safety
            </span>
          </div>
          <p
            style={{ fontSize: "14px", marginTop: "0.5rem", color: "#3d2c27" }}
          >
            Share your live location with a friend. Keep digital copies of your
            passport. Avoid empty train cars late at night.
          </p>
        </div>

        {isClient && spotsWithCoords.length > 0 && (
          <Suspense
            fallback={
              <div
                style={{
                  height: "400px",
                  background: "#f0eeec",
                  borderRadius: "24px",
                  marginBottom: "1.5rem",
                }}
              />
            }
          >
            <SpotMap spots={spotsWithCoords} />
          </Suspense>
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
        {!loading && !error && Object.keys(groupedByCountry).length === 0 && (
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
        {!loading && !error && Object.keys(groupedByCountry).length > 0 && (
          <div className="s-cards" style={{ gap: "2rem" }}>
            {Object.entries(groupedByCountry).map(([country, spots]) => (
              <div key={country}>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {country === "Japan" && "🇯🇵"} {country}
                  {country.toLowerCase() === "china" && (
                    <span
                      style={{
                        fontSize: "12px",
                        background: "#fff3e0",
                        padding: "2px 8px",
                        borderRadius: "40px",
                        color: "#b02f00",
                      }}
                    >
                      ⚠️ Plan before departure
                    </span>
                  )}
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                  }}
                >
                  {spots.map((spot) => (
                    <div key={spot.id} className="s-card">
                      <div className="s-card-img">
                        <div className="s-card-img-placeholder"></div>
                      </div>
                      <div className="s-card-body">
                        <div className="s-card-top">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="s-card-name">
                              {spot.name ? spot.name.trim() : "Unnamed spot"}
                              {spot.country?.toLowerCase() === "china" && (
                                <span
                                  style={{
                                    marginLeft: "0.5rem",
                                    fontSize: "12px",
                                    color: "#b02f00",
                                  }}
                                  title="Gojee may be partially blocked inside China. Plan your trip before departure."
                                >
                                  🛡️
                                </span>
                              )}
                            </div>
                            <div
                              className="s-card-url"
                              title={spot.instagram_url}
                            >
                              {spot.instagram_url}
                            </div>
                          </div>
                          <span className="s-card-date">
                            {new Date(spot.created_at || "").toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                timeZone: "UTC",
                              },
                            )}
                          </span>
                        </div>
                        <div
                          style={{
                            margin: "0.5rem 0",
                            fontSize: "13px",
                            color: "#8f7067",
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "center",
                          }}
                        >
                          <span>⏰</span> {suggestTimeOfDay(spot.name)}
                        </div>
                        <div
                          style={{
                            backgroundColor: "#f0eeec",
                            borderRadius: "12px",
                            padding: "0.75rem",
                            margin: "0.75rem 0",
                            fontSize: "13px",
                            color: "#3d2c27",
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>💡 AI tip</span>
                          <br />
                          {getAITip(spot.name, spot.country)}
                        </div>
                        <div className="s-card-actions">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name || spot.instagram_url)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="s-maps-btn"
                          >
                            Open Maps
                          </a>
                          <a
                            href={spot.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="s-maps-btn"
                          >
                            Instagram
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
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
        <a
          href="/safe-help"
          className={`s-nav-item ${pathname === "/safe-help" ? "active" : ""}`}
        >
          <span className="s-nav-icon">🛡️</span>
          <span>Safety</span>
        </a>
        <a
          href="/profile"
          className={`s-nav-item ${pathname === "/profile" ? "active" : ""}`}
        >
          <span className="s-nav-icon">👤</span>
          <span>Profile</span>
        </a>
      </nav>
    </div>
  );
}
