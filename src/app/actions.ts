"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function geocodeAndGetCity(
  spotName: string,
  country: string | null,
): Promise<{ lat: number; lng: number; city: string | null } | null> {
  const query = `${spotName} ${country || ""}`.trim();
  if (!query) return null;

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "GojeeApp/1.0" },
    });
    const data = await res.json();
    if (data && data[0]) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      let city: string | null = null;
      if (data[0].address) {
        city =
          data[0].address.city ||
          data[0].address.town ||
          data[0].address.village ||
          null;
      }
      return { lat, lng, city };
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
        set() {},
        remove() {},
      },
    },
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    throw new Error("You must be logged in to save spots");

  const geo = await geocodeAndGetCity(name || instagramUrl, country);

  const { error } = await supabase.from("trips").insert({
    instagram_url: instagramUrl,
    name: name || null,
    city: geo?.city || null,
    country: country || null,
    latitude: geo?.lat || null,
    longitude: geo?.lng || null,
    user_id: user.id,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Save error:", error.message);
    throw new Error("Failed to save trip");
  }

  return { success: true };
}
