"use client";
import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { saveTrip } from "../actions";
import "../trips/trips2.css";

export default function HomePage() {
  const pathname = usePathname();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveTrip(url, name || null, country || null);
      // handle result here if needed
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL"
      />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        type="text"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        placeholder="Country"
      />
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Trip"}
      </button>
    </form>
  );
}
