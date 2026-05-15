"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "@/app/trips/trips2.css";

export default function WelcomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (session) router.push("/home");
        else setLoading(false);
      });
  }, [router]);

  if (loading)
    return (
      <div className="s-app">
        <div className="s-content">Loading...</div>
      </div>
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
        <div className="s-topbar-right"></div>
      </div>

      <div
        className="s-content"
        style={{ maxWidth: "600px", margin: "0 auto", paddingTop: "2rem" }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              marginBottom: "0.5rem",
            }}
          >
            Travel made simple, anywhere.
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              color: "#8f7067",
              marginBottom: "2rem",
            }}
          >
            Save spots from Instagram. Plan your trip. Travel safely.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                background: "#f0eeec",
                padding: "0.75rem 1rem",
                borderRadius: "60px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#ff5a26" }}
              >
                photo_camera
              </span>
              <span>
                1. Save Instagram links → spot name & city are auto‑filled
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                background: "#f0eeec",
                padding: "0.75rem 1rem",
                borderRadius: "60px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#ff5a26" }}
              >
                group_work
              </span>
              <span>2. Spots are grouped by city – plan day by day</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                background: "#f0eeec",
                padding: "0.75rem 1rem",
                borderRadius: "60px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#ff5a26" }}
              >
                directions_walk
              </span>
              <span>
                3. See walking distances and reorder spots for the best route
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="s-maps-btn"
            style={{
              background: "#ff5a26",
              color: "white",
              padding: "1rem",
              fontSize: "1rem",
              width: "100%",
            }}
          >
            Get Started
          </button>
        </div>
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
