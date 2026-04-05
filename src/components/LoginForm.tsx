"use client";

import { useState } from "react";
import { loginWithGoogle, loginWithEmail } from "@/app/actions/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("email", email);
    try {
      await loginWithEmail(formData);
      setMessage("Check your email for a magic link ✨");
    } catch (err) {
      setMessage("Failed to send link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Join Gojee</h2>
      <button
        onClick={() => loginWithGoogle()}
        disabled={loading}
        className="google-btn"
      >
        Continue with Google
      </button>
      <div className="divider">or</div>
      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send magic link"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
