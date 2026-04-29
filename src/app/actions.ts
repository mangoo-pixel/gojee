export async function saveTrip(
  instagramUrl: string,
  name: string | null,
  city: string | null,
  country: string | null,
) {
  // ... rest of code (geocoding, auth, etc.)
  const { error } = await supabase.from("trips").insert({
    instagram_url: instagramUrl,
    name: name || null,
    city: city || null,
    country: country || null,
    latitude: coords?.lat || null,
    longitude: coords?.lng || null,
    user_id: user.id,
    created_at: new Date().toISOString(),
  });
  // ...
}
