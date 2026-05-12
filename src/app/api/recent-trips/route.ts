import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
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
    if (userError || !user) {
      return NextResponse.json({ trips: [] }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get("limit") || "3");
    const limit = Math.min(Math.max(limitParam, 1), 100);

    const { data, error } = await supabase
      .from("trips")
      .select(
        "id, name, city, instagram_url, created_at, country, latitude, longitude",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json({ trips: data ?? [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ trips: [] }, { status: 500 });
  }
}
