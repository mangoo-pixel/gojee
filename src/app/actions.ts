"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function geocodeLocation(
  spotName: string,
  country: string | null,
): Promise<{ lat: number; lng: number } | null> {
  if (!spotName && !country) return null;
  const query = `${spotName || ""} ${country || ""}`.trim();
  if (!query) return null;

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "GojeeApp/1.0" }, // Required by Nominatim
    });
    const data = await res.json();
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (err) {
    console.error("Geocoding failed:", err);
  }
  return null;
}

export async function saveTrip(
  instagramUrl: string,
  name: string | null,
  country: string | null,
) {
  if (!instagramUrl) throw new Error("Instagram URL is required");

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    },
  );

  // Geocode using spot name + country
  const coords = await geocodeLocation(name || instagramUrl, country);
  const { error } = await supabase.from("trips").insert({
    instagram_url: instagramUrl,
    name: name || null,
    country: country || null,
    latitude: coords?.lat || null,
    longitude: coords?.lng || null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Save error:", error.message);
    throw new Error("Failed to save trip");
  }

  return { success: true };
}
