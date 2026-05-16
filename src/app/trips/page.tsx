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

function cleanName(fullName: string | null): string {
  if (!fullName) return "Unnamed spot";
  const idx = fullName.indexOf(',');
  return idx !== -1 ? fullName.substring(0, idx).trim() : fullName.trim();
}

function getDisplayLocation(trip: Trip): string {
  const parts = [];
  if (trip.city?.trim()) parts.push(trip.city);
  if (trip.country?.trim()) parts.push(trip.country);
  return parts.join(", ");
}

const countryCodeMap: Record<string, string> = {
  japan: "JP", "united states": "US", usa: "US",
  // ... (keep your full map)
};
function getCountryCode(country: string | null): string | null {
  if (!country) return null;
  const lower = country.toLowerCase().trim();
  return countryCodeMap[lower] || null;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

function getMapsLink(trip: Trip): string {
  const query = encodeURIComponent(cleanName(trip.name) + (trip.country ? `, ${trip.country}` : ""));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

async function fetchAITip(spotName: string, city: string | null, country: string | null): Promise<string> {
  const location = city || country || "this area";
  const prompt = `Give a very short, helpful tip (max 15 words) for a solo traveller visiting "${spotName}" in ${location}. The tip can be about a hidden gem, a local custom, or a safety note. Never mention prices, opening hours, walking times, or distances. Keep it positive and practical.`;
  try {
    const res = await fetch("/api/ai-tip", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
    const data = await res.json();
    return data.tip || "✨ Ask a local for their favourite spot!";
  } catch {
    return "✨ Look around – you'll find something wonderful!";
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
  const [tips, setTips] = useState<Record<string, string>>({});
  const [loadingTips, setLoadingTips] = useState<Record<string, boolean>>({});
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
        if (err instanceof Error && err.name !== "AbortError") setError("Unable to load your spots. Refresh the page.");
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
      setFilteredTrips(trips.filter(trip =>
        (trip.name && trip.name.toLowerCase().includes(query)) ||
        (trip.city && trip.city.toLowerCase().includes(query)) ||
        (trip.country && trip.country.toLowerCase().includes(query))
      ));
    }
  }, [searchQuery, trips]);

  const handleDeleteConfirmed = useCallback(async () => {
    if (!deleteId || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteTripAction(deleteId);
      setTrips(prev => prev.filter(t => t.id !== deleteId));
      setFilteredTrips(prev => prev.filter(t => t.id !== deleteId));
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

  const handleGetTip = async (spotId: string, spotName: string, city: string | null, country: string | null) => {
    if (tips[spotId] || loadingTips[spotId]) return;
    setLoadingTips(prev => ({ ...prev, [spotId]: true }));
    const tip = await fetchAITip(spotName, city, country);
    setTips(prev => ({ ...prev, [spotId]: tip }));
    setLoadingTips(prev => ({ ...prev, [spotId]: false }));
  };

  return (
    <div className="s-app">
      {/* Topbar unchanged – copy your existing topbar */}
      <div className="s-topbar">...</div>

      <div className="s-content">
        <div className="s-hero">
          <h1>Saved Spots</h1>
          <span className="s-count-badge">{filteredTrips.length} saved</span>
        </div>

        <div className="s-search">...</div>

        {loading && <div className="s-empty"><p>Loading...</p></div>}
        {error && <div className="s-empty"><p>{error}</p></div>}
        {!loading && !error && filteredTrips.length === 0 && <div className="s-empty"><p>No spots saved yet.</p></div>}

        {!loading && !error && filteredTrips.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filteredTrips.map(trip => {
              const location = getDisplayLocation(trip);
              const displayName = cleanName(trip.name);
              const countryCode = getCountryCode(trip.country);
              const tip = tips[trip.id];
              const loadingTip = loadingTips[trip.id];
              return (
                <div key={trip.id} className="s-card" style={{ padding: "0.75rem 1rem", borderRadius: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                        {displayName}
                        {location && <span style={{ fontSize: "0.85rem", fontWeight: "normal", color: "#5b4039", marginLeft: "0.5rem" }}>– {location}</span>}
                        {countryCode && <ReactCountryFlag countryCode={countryCode} svg style={{ width: "1.2em", height: "1.2em", marginLeft: "0.5rem", verticalAlign: "middle" }} title={trip.country || ""} />}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#8f7067" }}>Saved {formatDate(trip.created_at)}</div>
                      {tip && <div style={{ fontSize: "0.75rem", marginTop: "0.25rem", background: "#f0eeec", padding: "0.25rem 0.5rem", borderRadius: "12px", display: "inline-block" }}>✨ {tip}</div>}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <a href={getMapsLink(trip)} target="_blank" rel="noopener noreferrer" className="s-maps-btn" style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem", background: "#f0eeec", color: "#1a1c1b" }}>Maps</a>
                      <a href={trip.instagram_url} target="_blank" rel="noopener noreferrer" className="s-maps-btn" style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem", background: "#ffb38e", color: "#3d2c27" }}>IG</a>
                      <button onClick={() => handleGetTip(trip.id, displayName, trip.city, trip.country)} disabled={!!tip || loadingTip} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", padding: "0.25rem", color: "#ff5a26" }} title="Get a friendly tip">
                        {loadingTip ? "⏳" : tip ? "✅" : "✨"}
                      </button>
                      <button onClick={() => setDeleteId(trip.id)} className="s-delete-btn" style={{ background: "none", border: "none", cursor: "pointer", color: "#8f7067", padding: "0.25rem" }} disabled={isDeleting}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Bottom spacer – prevents overlap */}
        <div style={{ height: "5rem" }} />
      </div>

      {/* Delete modal – copy from your existing file */}
      {deleteId && ( ... )}

      <nav className="s-nav">...</nav>
    </div>
  );
}