"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Trip = {
  id: string;
  name: string | null;
  city: string | null;
  instagram_url: string;
  created_at: string | null;
  country: string | null;
};

export default function SavedSpotsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/recent-trips?limit=100")
      .then(async (res) => {
        setStatus(res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTrips(data.trips || []);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (status === 401) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Please log in</h1>
        <p>You need to be logged in to see your saved spots.</p>
        <Link href="/login">Go to Login</Link>
      </div>
    );
  }

  if (loading)
    return <div style={{ padding: "2rem" }}>Loading your spots...</div>;
  if (error)
    return <div style={{ padding: "2rem", color: "red" }}>Error: {error}</div>;
  if (trips.length === 0)
    return <div style={{ padding: "2rem" }}>No saved spots yet.</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Saved Spots ({trips.length})</h1>
      <ul>
        {trips.map((trip) => (
          <li key={trip.id} style={{ marginBottom: "1rem" }}>
            <strong>{trip.name || "Unnamed"}</strong>
            {trip.city && <span> (📍 {trip.city})</span>}
            <br />
            <a
              href={trip.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
