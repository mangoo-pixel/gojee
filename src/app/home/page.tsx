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
  // ... rest of component (no city state)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveTrip(url, name || null, country || null);
      // ...
    });
  };
  // ... render (no city input)
}
