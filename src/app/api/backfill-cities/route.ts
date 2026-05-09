import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
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
    }
  );

  const { data: trips, error } = await supabase
    .from("trips")
    .select("id, name, country")
    .is("city", null)
    .limit(50); // adjust batch size

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let updated = 0;
  for (const trip of trips) {
    const geo = await geocodeLocationAndCity(trip.name || "", trip.country);
    if (geo?.city) {
      await supabase.from("trips").update({ city: geo.city }).eq("id", trip.id);
      updated++;
    }
  }
  return NextResponse.json({ updated });
}