import { createSupabaseServerClient } from "./supabaseServer";

export async function listTrips() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading trips:", error);
    if (error.message) {
      console.error("Supabase Error Message:", error.message);
    }
    if (error.code) {
      console.error("Supabase Error Code:", error.code);
    }
    return [];
  }

  return data || [];
}
