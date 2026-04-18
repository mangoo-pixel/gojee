"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import "@/app/trips/trips2.css";

export default function ProfilePage() {
  const pathname = usePathname();
  const [spotCount, setSpotCount] = useState(0);
  const [tripsPlanned, setTripsPlanned] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/recent-trips?limit=100");
        const data = await res.json();
        const count = data.trips?.length || 0;
        setSpotCount(count);
        const uniqueCountries = new Set(
          data.trips?.map((t: any) => t.country).filter(Boolean),
        );
        setTripsPlanned(uniqueCountries.size || 1);
      } catch (err) {
        console.error("Failed to fetch spot count");
      }
    };
    fetchCount();
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      alert("Logged out (mock). Auth will be added later.");
      window.location.href = "/";
    }
  };

  const showComingSoon = (feature: string) => {
    alert(`${feature} – coming soon!`);
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
          <h1>Profile</h1>
          <span className="s-count-badge">Your travel identity</span>
        </div>

        <div
          className="s-card"
          style={{
            marginBottom: "1.5rem",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "28px",
                overflow: "hidden",
                transform: "rotate(3deg)",
                margin: "0 auto",
                boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(135deg, #ffb38e, #ff8e6e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 56, color: "white" }}
                >
                  person
                </span>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "-8px",
                right: "-8px",
                background: "white",
                borderRadius: "40px",
                padding: "4px 12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontSize: "11px",
                fontWeight: "bold",
                color: "#ff5a26",
                border: "1px solid #ffb38e",
              }}
            >
              ✨ Solo
            </div>
          </div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              marginBottom: "0.25rem",
            }}
          >
            Sarah Jenkins
          </h2>
          <p style={{ color: "#8f7067", marginBottom: "0.5rem" }}>
            sarah.j@traveler.com
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            className="s-card"
            style={{
              padding: "1.5rem",
              textAlign: "center",
              background: "#f0eeec",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>📍</div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "#ff5a26",
                marginBottom: "0.25rem",
              }}
            >
              {spotCount}
            </div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#8f7067",
              }}
            >
              Spots Saved
            </div>
          </div>
          <div
            className="s-card"
            style={{
              padding: "1.5rem",
              textAlign: "center",
              background: "#ffb38e",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>🗺️</div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "#3d2c27",
                marginBottom: "0.25rem",
              }}
            >
              {tripsPlanned}
            </div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#3d2c27",
              }}
            >
              Trips Planned
            </div>
          </div>
        </div>

        <div
          className="s-card"
          style={{ padding: "1rem 0", marginBottom: "2rem" }}
        >
          <div style={{ padding: "0 1.5rem", marginBottom: "1rem" }}>
            <h3
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "#8f7067",
              }}
            >
              ⚙️ Preferences
            </h3>
          </div>
          <div>
            <div
              onClick={() => showComingSoon("Personal Information")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #e3e2e0",
                cursor: "pointer",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#ff5a26" }}
                  >
                    person
                  </span>
                </div>
                <span style={{ fontWeight: 500 }}>Personal Information</span>
              </div>
              <span
                className="material-symbols-outlined"
                style={{ color: "#8f7067" }}
              >
                chevron_right
              </span>
            </div>
            <a
              href="/safe-help"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #e3e2e0",
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#ff5a26" }}
                  >
                    shield
                  </span>
                </div>
                <span style={{ fontWeight: 500 }}>Safety Contacts</span>
              </div>
              <span
                className="material-symbols-outlined"
                style={{ color: "#8f7067" }}
              >
                chevron_right
              </span>
            </a>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #e3e2e0",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#ff5a26" }}
                  >
                    notifications
                  </span>
                </div>
                <span style={{ fontWeight: 500 }}>Notification Settings</span>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                style={{
                  background: notificationsEnabled ? "#ff5a26" : "#ccc",
                  width: "44px",
                  borderRadius: "24px",
                  padding: "2px",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "white",
                    transform: notificationsEnabled
                      ? "translateX(20px)"
                      : "translateX(0)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
            </div>
            <div
              onClick={() => showComingSoon("Help & Support")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #e3e2e0",
                cursor: "pointer",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#ff5a26" }}
                  >
                    help
                  </span>
                </div>
                <span style={{ fontWeight: 500 }}>Help &amp; Support</span>
              </div>
              <span
                className="material-symbols-outlined"
                style={{ color: "#8f7067" }}
              >
                chevron_right
              </span>
            </div>
            <div
              onClick={() => showComingSoon("Privacy Policy")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.5rem",
                cursor: "pointer",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#ff5a26" }}
                  >
                    lock
                  </span>
                </div>
                <span style={{ fontWeight: 500 }}>Privacy Policy</span>
              </div>
              <span
                className="material-symbols-outlined"
                style={{ color: "#8f7067" }}
              >
                chevron_right
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "2rem",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              padding: "1rem 2rem",
              borderRadius: "40px",
              background: "#e3e2e0",
              color: "#ff5a26",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ffdad6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#e3e2e0")}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "18px",
                verticalAlign: "middle",
                marginRight: "8px",
              }}
            >
              logout
            </span>
            Log out
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
