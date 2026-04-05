"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function deleteTripAction(id: string) {
  if (!id) throw new Error("Missing id");

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

  const { error } = await supabase.from("trips").delete().eq("id", id);

  if (error) {
    console.error("Delete error:", error.message);
    throw new Error("Failed to delete trip");
  }

  return { success: true };
}
