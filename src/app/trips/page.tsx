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
  const idx = fullName.indexOf(",");
  return idx !== -1 ? fullName.substring(0, idx).trim() : fullName.trim();
}

function getDisplayLocation(trip: Trip): string {
  const parts = [];
  if (trip.city?.trim()) parts.push(trip.city);
  if (trip.country?.trim()) parts.push(trip.country);
  return parts.join(", ");
}

const countryCodeMap: Record<string, string> = {
  japan: "JP",
  "united states": "US",
  usa: "US",
  "united kingdom": "GB",
  uk: "GB",
  canada: "CA",
  australia: "AU",
  france: "FR",
  italy: "IT",
  spain: "ES",
  germany: "DE",
  brazil: "BR",
  mexico: "MX",
  india: "IN",
  china: "CN",
  russia: "RU",
  "south korea": "KR",
  korea: "KR",
  netherlands: "NL",
  sweden: "SE",
  norway: "NO",
  denmark: "DK",
  finland: "FI",
  portugal: "PT",
  greece: "GR",
  turkey: "TR",
  thailand: "TH",
  vietnam: "VN",
  indonesia: "ID",
  malaysia: "MY",
  singapore: "SG",
  philippines: "PH",
  "south africa": "ZA",
  egypt: "EG",
  morocco: "MA",
  kenya: "KE",
  argentina: "AR",
  chile: "CL",
  colombia: "CO",
  peru: "PE",
  "new zealand": "NZ",
  ireland: "IE",
  belgium: "BE",
  austria: "AT",
  switzerland: "CH",
  poland: "PL",
  "czech republic": "CZ",
  hungary: "HU",
  romania: "RO",
  ukraine: "UA",
  israel: "IL",
  uae: "AE",
  "saudi arabia": "SA",
  qatar: "QA",
  pakistan: "PK",
  bangladesh: "BD",
  "sri lanka": "LK",
  nepal: "NP",
  iceland: "IS",
  croatia: "HR",
  serbia: "RS",
  bulgaria: "BG",
  slovenia: "SI",
  slovakia: "SK",
  estonia: "EE",
  latvia: "LV",
  lithuania: "LT",
  georgia: "GE",
  armenia: "AM",
  azerbaijan: "AZ",
  kazakhstan: "KZ",
  uzbekistan: "UZ",
  mongolia: "MN",
  cambodia: "KH",
  laos: "LA",
  myanmar: "MM",
  brunei: "BN",
  fiji: "FJ",
  maldives: "MV",
  bahamas: "BS",
  jamaica: "JM",
  cuba: "CU",
  "dominican republic": "DO",
  "costa rica": "CR",
  panama: "PA",
  ecuador: "EC",
  bolivia: "BO",
  paraguay: "PY",
  uruguay: "UY",
  venezuela: "VE",
  guyana: "GY",
  suriname: "SR",
  algeria: "DZ",
  tunisia: "TN",
  libya: "LY",
  sudan: "SD",
  ethiopia: "ET",
  somalia: "SO",
  uganda: "UG",
  rwanda: "RW",
  tanzania: "TZ",
  mozambique: "MZ",
  madagascar: "MG",
  angola: "AO",
  ghana: "GH",
  nigeria: "NG",
  senegal: "SN",
  cameroon: "CM",
  zimbabwe: "ZW",
  zambia: "ZM",
  malawi: "MW",
  botswana: "BW",
  namibia: "NA",
  eswatini: "SZ",
  lesotho: "LS",
  taiwan: "TW",
};

function getCountryCode(country: string | null): string | null {
  if (!country) return null;
  const lower = country.toLowerCase().trim();
  return countryCodeMap[lower] || null;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function getMapsLink(trip: Trip): string {
  const query = encodeURIComponent(
    cleanName(trip.name) + (trip.country ? `, ${trip.country}` : ""),
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
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
        const res = await fetch("/api/recent-trips?limit=100", {
          signal: abortController.signal,
        });
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
            (trip.city && trip.city.toLowerCase().includes(query)) ||
            (trip.country && trip.country.toLowerCase().includes(query)),
        ),
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
    return () => {
      document.body.style.overflow = "";
    };
  }, [deleteId]);

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
          <h1>Saved Spots</h1>
          <span className="s-count-badge">
            {filteredTrips.length} {filteredTrips.length === 1 ? "gem" : "gems"}{" "}
            saved
          </span>
        </div>

        <div className="s-search">
          <span className="s-search-icon material-symbols-outlined">
            search
          </span>
          <input
            type="text"
            placeholder="Search name, city, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading && (
          <div className="s-empty">
            <p>Loading your spots...</p>
          </div>
        )}
        {error && (
          <div className="s-empty">
            <span className="s-empty-icon">error</span>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            {error.includes("log in") ? (
              <a href="/login" className="s-empty-link">
                Log in
              </a>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="s-empty-link"
              >
                Try again
              </button>
            )}
          </div>
        )}
        {!loading && !error && filteredTrips.length === 0 && (
          <div className="s-empty">
            <span className="s-empty-icon">explore_off</span>
            <h2>No spots saved yet</h2>
            <a href="/" className="s-empty-link">
              Save your first spot
            </a>
          </div>
        )}

        {!loading && !error && filteredTrips.length > 0 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {filteredTrips.map((trip) => {
              const location = getDisplayLocation(trip);
              const displayName = cleanName(trip.name);
              const countryCode = getCountryCode(trip.country);
              return (
                <div
                  key={trip.id}
                  className="s-card"
                  style={{ padding: "0.75rem 1rem", borderRadius: "16px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                        {displayName}
                        {location && (
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: "normal",
                              color: "#5b4039",
                              marginLeft: "0.5rem",
                            }}
                          >
                            – {location}
                          </span>
                        )}
                        {countryCode && (
                          <ReactCountryFlag
                            countryCode={countryCode}
                            svg
                            style={{
                              width: "1.2em",
                              height: "1.2em",
                              marginLeft: "0.5rem",
                              verticalAlign: "middle",
                            }}
                            title={trip.country || ""}
                          />
                        )}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#8f7067" }}>
                        Saved {formatDate(trip.created_at)}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <a
                        href={getMapsLink(trip)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="s-maps-btn"
                        style={{
                          padding: "0.25rem 0.75rem",
                          fontSize: "0.75rem",
                          background: "#f0eeec",
                          color: "#1a1c1b",
                        }}
                      >
                        Maps
                      </a>
                      <a
                        href={trip.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="s-maps-btn"
                        style={{
                          padding: "0.25rem 0.75rem",
                          fontSize: "0.75rem",
                          background: "#ffb38e",
                          color: "#3d2c27",
                        }}
                      >
                        IG
                      </a>
                      <button
                        onClick={() => setDeleteId(trip.id)}
                        className="s-delete-btn"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#8f7067",
                          padding: "0.25rem",
                        }}
                        disabled={isDeleting}
                      >
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteId && (
        <div
          className="s-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="s-modal">
            <h3 id="modal-title">Remove this spot?</h3>
            <p>You can always add it again later.</p>
            <div className="s-modal-actions">
              <button
                ref={cancelButtonRef}
                className="s-btn-secondary"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="s-btn-danger"
                onClick={handleDeleteConfirmed}
                disabled={isDeleting}
              >
                {isDeleting ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

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
