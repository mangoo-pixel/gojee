import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get("limit") || "3");
    const limit = Math.min(Math.max(limitParam, 1), 100);

    const { data, error } = await supabase
      .from("trips")
      .select(
        "id, name, instagram_url, created_at, country, latitude, longitude",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json({ trips: data ?? [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ trips: [] }, { status: 500 });
  }
}
