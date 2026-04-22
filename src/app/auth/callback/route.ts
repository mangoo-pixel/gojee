import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Hardcoded production URL – ensures redirect goes to the live site
  const baseUrl = "https://gojee.vercel.app";
  return NextResponse.redirect(`${baseUrl}/home`);
}
