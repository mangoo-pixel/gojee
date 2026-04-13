"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import "@/app/trips/trips2.css";

type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  icon: string;
};

export default function SafetyPage() {
  const pathname = usePathname();
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    city: string;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [sunsetTime, setSunsetTime] = useState<string | null>(null);
  const [checklist, setChecklist] = useState({
    phoneCharged: false,
    powerBank: false,
    sharedLocation: false,
    emergencyCash: false,
  });
  const [reportMessage, setReportMessage] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("gojee_emergency_contacts");
    if (saved) setContacts(JSON.parse(saved));
    else
      setContacts([
        {
          id: "1",
          name: "Hotel Reception",
          phone: "tel:0987654321",
          icon: "hotel",
        },
      ]);
  }, []);

  useEffect(() => {
    if (contacts.length)
      localStorage.setItem(
        "gojee_emergency_contacts",
        JSON.stringify(contacts),
      );
  }, [contacts]);

  const addContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim())
      return alert("Enter both name and phone.");
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      phone: newContactPhone.trim().startsWith("tel:")
        ? newContactPhone.trim()
        : `tel:${newContactPhone.trim()}`,
      icon: "contact_phone",
    };
    setContacts([...contacts, newContact]);
    setNewContactName("");
    setNewContactPhone("");
    setShowContactForm(false);
  };

  const deleteContact = (id: string) =>
    setContacts(contacts.filter((c) => c.id !== id));

  const refreshLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            "Unknown";
          setLocation({ lat: latitude, lng: longitude, city });
          setLocationStatus("success");
          const sunsetRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunset&timezone=auto`,
          );
          const sunsetData = await sunsetRes.json();
          if (sunsetData.daily?.sunset?.[0]) {
            const sunset = new Date(sunsetData.daily.sunset[0]);
            setSunsetTime(
              sunset.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            );
          }
        } catch (err) {
          console.error(err);
          setLocation({ lat: latitude, lng: longitude, city: "Unknown" });
          setLocationStatus("success");
        }
      },
      () => {
        alert("Location permission denied.");
        setLocationStatus("error");
      },
    );
  };

  useEffect(() => {
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level * 100);
        battery.addEventListener("levelchange", () =>
          setBatteryLevel(battery.level * 100),
        );
      });
    }
  }, []);

  const handleSOS = () => {
    if (confirm("Emergency SOS will call local police (110). Continue?"))
      window.location.href = "tel:110";
  };

  const shareLocation = () => {
    if (navigator.share && location)
      navigator.share({
        title: "My live location",
        text: `I'm at ${location.city}`,
        url: `https://maps.google.com/?q=${location.lat},${location.lng}`,
      });
    else if (location) {
      navigator.clipboard.writeText(
        `${location.city}: ${location.lat}, ${location.lng}`,
      );
      alert("Location copied!");
    } else alert("Enable location first.");
  };

  const safeRoutes = () => {
    if (location)
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=police+station+near+me`,
        "_blank",
      );
    else alert("Enable location first.");
  };

  const walkHomeSafely = () => {
    if (location)
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=hotel+near+me`,
        "_blank",
      );
    else alert("Enable location first.");
  };

  const checkInWithFriend = () => {
    const message = `Hey, I'm safe at ${location?.city || "my current location"}. Just checking in!`;
    if (navigator.share) navigator.share({ title: "Check-in", text: message });
    else alert(message + "\n(Share not supported – copy this message)");
  };

  const reportIssue = () => {
    if (!reportMessage.trim()) return alert("Please describe the issue.");
    console.log("Report:", reportMessage, "Location:", location);
    setReportStatus("Thanks! Your report helps others.");
    setReportMessage("");
    setTimeout(() => setReportStatus(""), 3000);
  };

  useEffect(() => {
    refreshLocation();
  }, []);

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
          <h1>Safety Hub</h1>
          <span className="s-count-badge">Peace of mind, anywhere you go</span>
        </div>

        {batteryLevel !== null && batteryLevel < 20 && (
          <div
            className="s-search"
            style={{
              backgroundColor: "#ffe5df",
              borderRadius: "16px",
              padding: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <span style={{ color: "#b02f00", fontWeight: 600 }}>
              ⚠️ Battery low ({Math.round(batteryLevel)}%) – please charge soon.
            </span>
          </div>
        )}

        <div
          className="s-card"
          style={{ padding: "1rem", marginBottom: "1.5rem" }}
        >
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#ffb38e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 28, color: "#3d2c27" }}
              >
                shield_with_heart
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700 }}>You're safe</h3>
              <p style={{ fontSize: "14px", color: "#8f7067" }}>
                {locationStatus === "loading"
                  ? "Getting location..."
                  : location?.city || "Unknown location"}
              </p>
              {sunsetTime && (
                <p style={{ fontSize: "12px", color: "#8f7067" }}>
                  🌇 Sunset today: {sunsetTime}
                </p>
              )}
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: "160px",
              backgroundColor: "#e3e2e0",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 48, color: "#8f7067" }}
            >
              map
            </span>
          </div>
          <button
            onClick={refreshLocation}
            disabled={locationStatus === "loading"}
            className="s-maps-btn"
            style={{ width: "100%", background: "#ffb38e", color: "#3d2c27" }}
          >
            {locationStatus === "loading"
              ? "Refreshing..."
              : "Refresh Location"}
          </button>
        </div>

        <button
          onClick={handleSOS}
          className="s-maps-btn"
          style={{
            width: "100%",
            background: "#93000a",
            color: "white",
            fontSize: "18px",
            padding: "1rem",
            marginBottom: "1.5rem",
            boxShadow: "0 0 20px rgba(147,0,10,0.2)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ marginRight: "0.5rem" }}
          >
            warning
          </span>{" "}
          Emergency SOS
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <button
            onClick={shareLocation}
            style={{
              background: "#ffb38e",
              borderRadius: "16px",
              padding: "1rem",
              aspectRatio: "1/1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 32 }}
            >
              location_on
            </span>
            <span style={{ fontWeight: 600 }}>Share Location</span>
          </button>
          <button
            onClick={safeRoutes}
            style={{
              background: "#ffb38e",
              borderRadius: "16px",
              padding: "1rem",
              aspectRatio: "1/1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 32 }}
            >
              map
            </span>
            <span style={{ fontWeight: 600 }}>Safe Routes</span>
          </button>
          <button
            onClick={walkHomeSafely}
            style={{
              background: "#ffb38e",
              borderRadius: "16px",
              padding: "1rem",
              aspectRatio: "1/1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 32 }}
            >
              home
            </span>
            <span style={{ fontWeight: 600 }}>Walk Home</span>
          </button>
          <button
            onClick={checkInWithFriend}
            style={{
              background: "#ffb38e",
              borderRadius: "16px",
              padding: "1rem",
              aspectRatio: "1/1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 32 }}
            >
              chat
            </span>
            <span style={{ fontWeight: 600 }}>Check‑in</span>
          </button>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              📞 Quick contacts
            </h3>
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              style={{
                background: "none",
                border: "none",
                color: "#ff5a26",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              + Add contact
            </button>
          </div>
          {showContactForm && (
            <div
              style={{
                backgroundColor: "#f0eeec",
                borderRadius: "16px",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <input
                type="text"
                placeholder="Name (e.g., Mom)"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginBottom: "0.5rem",
                  borderRadius: "12px",
                  border: "1px solid #ddd",
                }}
              />
              <input
                type="tel"
                placeholder="Phone number (e.g., +1234567890)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginBottom: "0.5rem",
                  borderRadius: "12px",
                  border: "1px solid #ddd",
                }}
              />
              <button
                onClick={addContact}
                style={{
                  background: "#ff5a26",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "40px",
                  cursor: "pointer",
                }}
              >
                Save contact
              </button>
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              overflowX: "auto",
              paddingBottom: "0.5rem",
            }}
          >
            {contacts.map((contact) => (
              <div
                key={contact.id}
                style={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "#fff",
                  padding: "0.5rem 0.75rem 0.5rem 1rem",
                  borderRadius: "40px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <a
                  href={contact.phone}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    textDecoration: "none",
                    color: "#3d2c27",
                    fontWeight: 500,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20 }}
                  >
                    {contact.icon}
                  </span>
                  {contact.name}
                </a>
                <button
                  onClick={() => deleteContact(contact.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#999",
                    fontSize: "16px",
                    padding: "0 4px",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            {contacts.length === 0 && (
              <p style={{ color: "#8f7067", fontSize: "14px" }}>
                No contacts yet. Add one above.
              </p>
            )}
          </div>
        </div>

        <div
          className="s-card"
          style={{ padding: "1rem", marginBottom: "1.5rem" }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            🚨 Local emergencies (Japan)
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <a
              href="tel:110"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "white",
                padding: "0.75rem 1rem",
                borderRadius: "16px",
                textDecoration: "none",
                color: "#3d2c27",
                border: "1px solid #e4beb4",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 24, color: "#ff5a26" }}
                >
                  local_police
                </span>
                <span style={{ fontWeight: 500 }}>Police</span>
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                110
              </span>
            </a>
            <a
              href="tel:119"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "white",
                padding: "0.75rem 1rem",
                borderRadius: "16px",
                textDecoration: "none",
                color: "#3d2c27",
                border: "1px solid #e4beb4",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 24, color: "#ff5a26" }}
                >
                  local_fire_department
                </span>
                <span style={{ fontWeight: 500 }}>Ambulance / Fire</span>
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                119
              </span>
            </a>
            <a
              href="tel:0570000911"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "white",
                padding: "0.75rem 1rem",
                borderRadius: "16px",
                textDecoration: "none",
                color: "#3d2c27",
                border: "1px solid #e4beb4",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 24, color: "#ff5a26" }}
                >
                  help
                </span>
                <span style={{ fontWeight: 500 }}>
                  Japan Helpline (English)
                </span>
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                0570-000-911
              </span>
            </a>
          </div>
        </div>

        <div
          className="s-card"
          style={{ padding: "1rem", marginBottom: "1.5rem" }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            ✅ Before going out
          </h3>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            <input
              type="checkbox"
              checked={checklist.phoneCharged}
              onChange={(e) =>
                setChecklist({ ...checklist, phoneCharged: e.target.checked })
              }
            />{" "}
            Phone charged
          </label>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            <input
              type="checkbox"
              checked={checklist.powerBank}
              onChange={(e) =>
                setChecklist({ ...checklist, powerBank: e.target.checked })
              }
            />{" "}
            Power bank
          </label>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            <input
              type="checkbox"
              checked={checklist.sharedLocation}
              onChange={(e) =>
                setChecklist({ ...checklist, sharedLocation: e.target.checked })
              }
            />{" "}
            Shared location with friend
          </label>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            <input
              type="checkbox"
              checked={checklist.emergencyCash}
              onChange={(e) =>
                setChecklist({ ...checklist, emergencyCash: e.target.checked })
              }
            />{" "}
            Emergency cash
          </label>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            📢 Report a safety issue
          </h3>
          <textarea
            placeholder="Describe unsafe area or situation..."
            value={reportMessage}
            onChange={(e) => setReportMessage(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "16px",
              border: "1px solid #ddd",
              marginBottom: "0.5rem",
              fontFamily: "inherit",
            }}
            rows={2}
          />
          <button
            onClick={reportIssue}
            className="s-maps-btn"
            style={{ background: "#ff5a26", color: "white" }}
          >
            Submit report
          </button>
          {reportStatus && (
            <p
              style={{ marginTop: "0.5rem", fontSize: "13px", color: "green" }}
            >
              {reportStatus}
            </p>
          )}
        </div>
        <div style={{ height: "2rem" }} />
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
