"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SavedSpotsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch("/api/recent-trips?limit=100")
      .then(async (res) => {
        setStatus(res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        console.log("API response:", json);
        setData(json);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
      });
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

  if (error)
    return <div style={{ padding: "2rem", color: "red" }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: "2rem" }}>Loading...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Saved Spots</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
