"use client";

import { useRouter, usePathname } from "next/navigation";
import "@/app/trips/trips2.css";

export default function WelcomePage() {
  const router = useRouter();
  const pathname = usePathname();

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
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "1rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "280px",
            margin: "0 auto 1.5rem auto",
          }}
        >
          <div
            style={{ position: "relative", width: "100%", aspectRatio: "1/1" }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#ffb38e20",
                borderRadius: "50%",
                filter: "blur(40px)",
              }}
            ></div>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuATnBXJCQ1ms1CQVceO8Ugjccc1fmiRXOq1O9TUlG_zFlMsCPCj7BF7aa_M2rNKGFSKjJpRyJWy_v40BWr1NbppxldPafP05SMeIDT6BURgFuBhtgSXsvEKxRlixFpIdvlqluT4fcIPXiZPnzlSqwUyEw6qaqeLIx6AebsoNrPFbo5sHYH02KxXsmEmlMazc2sZwCUdVLMW7CKH9h5Qu7745U6rQD31j46NaiwezmmSfJ0y8m5Fbo5eEH2s_qp1EKASBGMRpJD4zI_D"
              alt="Compass and map illustration"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                position: "relative",
                zIndex: 2,
              }}
            />
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: "0.5rem",
              color: "#1a1c1b",
            }}
          >
            Travel made simple, anywhere.
          </h2>
          <p style={{ fontSize: "1rem", color: "#8f7067" }}>
            Save spots from Instagram. Plan your trip. Travel safely.
          </p>
        </div>

        <div style={{ width: "100%", marginBottom: "2rem" }}>
          <div
            className="s-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "0.75rem 1rem",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#ffb38e20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#ff5a26" }}
              >
                location_on
              </span>
            </div>
            <span
              style={{ fontWeight: 600, fontSize: "1rem", color: "#1a1c1b" }}
            >
              Save any spot
            </span>
          </div>
          <div
            className="s-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "0.75rem 1rem",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#ffb38e20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#ff5a26" }}
              >
                map
              </span>
            </div>
            <span
              style={{ fontWeight: 600, fontSize: "1rem", color: "#1a1c1b" }}
            >
              Plan your route
            </span>
          </div>
          <div
            className="s-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "0.75rem 1rem",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#ffb38e20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#ff5a26" }}
              >
                shield_with_heart
              </span>
            </div>
            <span
              style={{ fontWeight: 600, fontSize: "1rem", color: "#1a1c1b" }}
            >
              Stay safe
            </span>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginBottom: "2rem",
          }}
        >
          <button
            onClick={() => router.push("/home")}
            className="s-maps-btn"
            style={{
              background: "#ff5a26",
              color: "white",
              padding: "1rem",
              fontSize: "1rem",
            }}
          >
            Get Started
          </button>
          <button
            onClick={() => router.push("/profile")}
            style={{
              background: "transparent",
              border: "2px solid #e4beb4",
              borderRadius: "40px",
              padding: "1rem",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              color: "#1a1c1b",
            }}
          >
            Log In
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
