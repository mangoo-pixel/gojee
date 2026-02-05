"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerOnlyClient } from "@/lib/supabaseServerOnly";

export type SaveTripResult = { success: true } | { success: false; error: string };

export async function saveTrip(formData: FormData): Promise<SaveTripResult> {
  const instagramUrl = formData.get("instagramUrl")?.toString().trim();
  const title =
    formData.get("title")?.toString().trim() || "My Haru-chan Trip";

  if (!instagramUrl) {
    return { success: false, error: "Please paste an Instagram link." };
  }

  try {
    const supabase = createSupabaseServerOnlyClient();

    const { error } = await supabase.from("trips").insert({
      instagram_url: instagramUrl,
      title,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return {
        success: false,
        error: error.message ?? "Could not save trip. Please try again.",
      };
    }

    revalidatePath("/");
    revalidatePath("/my-trip");
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Connection failed. Please try again.";
    console.error("saveTrip error:", err);
    return { success: false, error: message };
  }
}

