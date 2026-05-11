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

// Helper to get clean name (remove trailing ", city")
function getCleanName(fullName: string | null): string {
  if (!fullName) return "Unnamed spot";
  const lastComma = fullName.lastIndexOf(",");
  if (lastComma !== -1) {
    return fullName.substring(0, lastComma).trim();
  }
  return fullName.trim();
}

// Country code mapping (same as before – keep your existing map)
const countryCodeMap: Record<string, string> = {
  // ... (your full map, I'll skip for brevity, but keep it)
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

  // fetch trips, etc. (unchanged) ...

  return (
    <div className="s-app">
      {/* topbar, hero, search – unchanged */}
      <div className="s-cards">
        {filteredTrips.map((trip) => {
          const countryCode = getCountryCode(trip.country);
          const cleanName = getCleanName(trip.name);
          return (
            <div key={trip.id} className="s-card">
              <div className="s-card-body" style={{ padding: "1rem" }}>
                <div className="s-card-top">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="s-card-name">
                      {cleanName}
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
                              width: "1.2em",
                              height: "1.2em",
                              verticalAlign: "middle",
                            }}
                            title={trip.country || ""}
                          />
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
                    <div className="s-card-url">...</div>
                  </div>
                  <span className="s-card-date">...</span>
                </div>
                <div className="s-card-actions">...</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* modal, bottom nav – unchanged */}
    </div>
  );
}
