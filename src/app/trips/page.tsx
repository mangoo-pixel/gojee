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

// Comprehensive country name → country code mapping (ISO 3166-1 alpha-2)
const countryCodeMap: Record<string, string> = {
  "united states": "US",
  usa: "US",
  us: "US",
  "united kingdom": "GB",
  uk: "GB",
  england: "GB",
  canada: "CA",
  australia: "AU",
  france: "FR",
  italy: "IT",
  spain: "ES",
  germany: "DE",
  japan: "JP",
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
  "timor leste": "TL",
  "papua new guinea": "PG",
  fiji: "FJ",
  "solomon islands": "SB",
  vanuatu: "VU",
  samoa: "WS",
  tonga: "TO",
  maldives: "MV",
  mauritius: "MU",
  seychelles: "SC",
  bahamas: "BS",
  jamaica: "JM",
  cuba: "CU",
  "dominican republic": "DO",
  "puerto rico": "PR",
  "costa rica": "CR",
  panama: "PA",
  guatemala: "GT",
  honduras: "HN",
  "el salvador": "SV",
  nicaragua: "NI",
  ecuador: "EC",
  bolivia: "BO",
  paraguay: "PY",
  uruguay: "UY",
  venezuela: "VE",
  guyana: "GY",
  suriname: "SR",
  "french guiana": "GF",
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
  "ivory coast": "CI",
  cameroon: "CM",
  zimbabwe: "ZW",
  zambia: "ZM",
  malawi: "MW",
  botswana: "BW",
  namibia: "NA",
  eswatini: "SZ",
  lesotho: "LS",
  taiwan: "TW",
  "taiwan, province of china": "TW",
  roc: "TW",
  taipei: "TW",
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
        const response = await fetch("/api/recent-trips?limit=100", {
          signal: abortController.signal,
        });
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setTrips(data.trips || []);
        setFilteredTrips(data.trips || []);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Unable to load your spots. Please refresh the page.");
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
            (trip.instagram_url &&
              trip.instagram_url.toLowerCase().includes(query)) ||
            (trip.country && trip.country.toLowerCase().includes(query)) ||
            (trip.city && trip.city.toLowerCase().includes(query)),
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

  const getMapsLink = (trip: Trip) => {
    let query = trip.name ? trip.name.trim() : "";
    if (trip.country) {
      query += `, ${trip.country}`;
    }
    if (!query) query = trip.instagram_url || "restaurant";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });
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
            placeholder="Search by name, location, URL, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search your saved spots"
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
            <button
              onClick={() => window.location.reload()}
              className="s-empty-link"
              style={{
                background: "#ff5a26",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && filteredTrips.length === 0 && (
          <div className="s-empty">
            <span className="s-empty-icon">explore_off</span>
            <h2>{searchQuery ? "No matching spots" : "No spots saved yet"}</h2>
            <p>
              {searchQuery
                ? "Try a different search term"
                : "Gojee is waiting for your first discovery!"}
            </p>
            {!searchQuery && (
              <a href="/" className="s-empty-link">
                Save your first spot
              </a>
            )}
          </div>
        )}
        {!loading && !error && filteredTrips.length > 0 && (
          <div className="s-cards">
            {filteredTrips.map((trip) => {
              const countryCode = getCountryCode(trip.country);
              return (
                <div key={trip.id} className="s-card">
                  <div className="s-card-body" style={{ padding: "1rem" }}>
                    <div className="s-card-top">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="s-card-name">
                          {trip.name ? trip.name.trim() : "Unnamed spot"}
                          {trip.city && (
                            <span
                              style={{
                                marginLeft: "0.5rem",
                                fontSize: "12px",
                                fontWeight: "normal",
                                color: "#8f7067",
                              }}
                            >
                              📍 {trip.city}
                            </span>
                          )}
                          {countryCode && (
                            <span
                              style={{ marginLeft: "0.5rem", fontSize: "14px" }}
                            >
                              <ReactCountryFlag
                                countryCode={countryCode}
                                svg
                                style={{
                                  width: "1em",
                                  height: "1em",
                                  marginRight: "0.3em",
                                  verticalAlign: "middle",
                                }}
                                title={trip.country || ""}
                              />
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "normal",
                                  color: "#5b4039",
                                }}
                              >
                                {trip.country}
                              </span>
                            </span>
                          )}
                          {!countryCode && trip.country && (
                            <span
                              style={{
                                marginLeft: "0.5rem",
                                fontSize: "12px",
                                color: "#8f7067",
                              }}
                            >
                              🌍 {trip.country}
                            </span>
                          )}
                        </div>
                        <div className="s-card-url" title={trip.instagram_url}>
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: 14,
                              verticalAlign: "middle",
                              marginRight: 4,
                            }}
                          >
                            link
                          </span>
                          {trip.instagram_url}
                        </div>
                      </div>
                      <span className="s-card-date">
                        {formatDate(trip.created_at)}
                      </span>
                    </div>
                    <div className="s-card-actions">
                      <a
                        href={getMapsLink(trip)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="s-maps-btn"
                        aria-label="Open in Google Maps"
                      >
                        Open Maps
                      </a>
                      <a
                        href={trip.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="s-maps-btn"
                        aria-label="Open Instagram post"
                      >
                        Instagram
                      </a>
                      <button
                        onClick={() => setDeleteId(trip.id)}
                        className="s-delete-btn"
                        title="Delete spot"
                        aria-label="Delete spot"
                        disabled={isDeleting}
                      >
                        🗑️
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
