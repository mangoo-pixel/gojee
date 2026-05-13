"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { deleteTripAction } from "./actions";
import ReactCountryFlag from "react-country-flag";
import "./trips2.css";

type Trip = {
  id: string;
  name: string | null;
  city: string | null;
  instagram_url: string;
  created_at: string | null;
  country: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

// Clean name: remove anything after the first comma
function cleanName(fullName: string | null): string {
  if (!fullName) return "Unnamed spot";
  const idx = fullName.indexOf(',');
  return idx !== -1 ? fullName.substring(0, idx).trim() : fullName.trim();
}

// Country code mapping (keep your existing full map)
const countryCodeMap: Record<string, string> = {
  // ... (paste your full map here — I'll omit for brevity but you must keep it)
};

function getCountryCode(country: string | null): string | null {
  if (!country) return null;
  const lower = country.toLowerCase().trim();
  if (countryCodeMap[lower]) return countryCodeMap[lower];
  for (const [key, code] of Object.entries(countryCodeMap)) {
    if (lower.includes(key)) return code;
  }
  return null;
}

function getDisplayCity(trip: Trip): string | null {
  if (trip.city?.trim()) return trip.city.trim();
  // Fallback: extract from cleaned name? Better to rely on SQL update, but as safeguard:
  const name = cleanName(trip.name).toLowerCase();
  if (name.includes("tokyo")) return "Tokyo";
  if (name.includes("kyoto")) return "Kyoto";
  if (name.includes("osaka")) return "Osaka";
  return null;
}

function shortenUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("instagram.com")) {
      const path = u.pathname;
      if (path.includes("/p/")) return "📸 Instagram post";
      if (path.includes("/reel/")) return "📽️ Instagram Reel";
      return "📷 Instagram";
    }
    return url.length > 40 ? url.substring(0, 40) + "…" : url;
  } catch {
    return url;
  }
}

export default function SavedSpotsPage() {
  const pathname = usePathname();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchTrips = async () => {
      try {
        const res = await fetch("/api/recent-trips?limit=100", { signal: abortController.signal });
        if (res.status === 401) {
          setError("Please log in to view your saved spots.");
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setTrips(data.trips || []);
        setFilteredTrips(data.trips || []);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Unable to load your spots. Refresh the page.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) setFilteredTrips(trips);
    else {
      setFilteredTrips(
        trips.filter(
          (trip) =>
            (trip.name && trip.name.toLowerCase().includes(query)) ||
            (trip.instagram_url && trip.instagram_url.toLowerCase().includes(query)) ||
            (trip.country && trip.country.toLowerCase().includes(query)) ||
            (trip.city && trip.city.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, trips]);

  const handleDeleteConfirmed = useCallback(async () => {
    if (!deleteId || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteTripAction(deleteId);
      setTrips((prev) => prev.filter((t) => t.id !== deleteId));
      setFilteredTrips((prev) => prev.filter((t) => t.id !== deleteId));
    } catch (e) {
      alert("Failed to delete. Try again.");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }, [deleteId, isDeleting]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && deleteId) setDeleteId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteId]);

  useEffect(() => {
    if (deleteId && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [deleteId]);

  const getMapsLink = (trip: Trip) => {
    const query = encodeURIComponent(cleanName(trip.name) + (trip.country ? `, ${trip.country}` : ""));
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  };

  return (
    <div className="s-app">
      {/* topbar unchanged */}
      <div className="s-topbar">...</div>

      <div className="s-content">
        <div className="s-hero">
          <h1>Saved Spots</h1>
          <span className="s-count-badge">{filteredTrips.length} saved</span>
        </div>

        <div className="s-search">
          <span className="s-search-icon material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search name, city, country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading && <div className="s-empty"><p>Loading...</p></div>}
        {error && <div className="s-empty"><p>{error}</p></div>}
        {!loading && !error && filteredTrips.length === 0 && <div className="s-empty"><p>No spots saved yet.</p></div>}

        {!loading && !error && filteredTrips.length > 0 && (
          <div className="cards-list" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredTrips.map((trip) => {
              const countryCode = getCountryCode(trip.country);
              const displayCity = getDisplayCity(trip);
              const name = cleanName(trip.name);
              return (
                <div key={trip.id} className="s-card" style={{ padding: "1rem", borderRadius: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem", color: "#1a1c1b" }}>
                        {name}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                        {displayCity && (
                          <span style={{
                            background: "#f0eeec",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "30px",
                            fontSize: "0.75rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.2rem"
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "0.9rem" }}>location_on</span>
                            {displayCity}
                          </span>
                        )}
                        {countryCode && (
                          <ReactCountryFlag
                            countryCode={countryCode}
                            svg
                            style={{ width: "1.4em", height: "1.4em", borderRadius: "2px" }}
                            title={trip.country || ""}
                          />
                        )}
                        <span style={{ fontSize: "0.7rem", color: "#8f7067" }}>
                          📅 {formatDate(trip.created_at)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteId(trip.id)}
                      className="s-delete-btn"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#8f7067", padding: "0.25rem" }}
                      disabled={isDeleting}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                    <a
                      href={getMapsLink(trip)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="s-maps-btn"
                      style={{ flex: 1, textAlign: "center", background: "#f0eeec", color: "#1a1c1b", padding: "0.5rem", borderRadius: "40px", fontSize: "0.8rem", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>map</span> Maps
                    </a>
                    <a
                      href={trip.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="s-maps-btn"
                      style={{ flex: 1, textAlign: "center", background: "#ffb38e", color: "#3d2c27", padding: "0.5rem", borderRadius: "40px", fontSize: "0.8rem", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>photo_camera</span> Instagram
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete modal unchanged */}
      {deleteId && ( ... )}

      {/* Bottom nav unchanged */}
      <nav className="s-nav">...</nav>
    </div>
  );
}