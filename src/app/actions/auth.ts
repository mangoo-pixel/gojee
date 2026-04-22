"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginWithGoogle() {
  const supabase = await createServerSupabaseClient();
  // Hardcoded production URL – no environment variable needed
  const baseUrl = "https://gojee.vercel.app";
  const redirectTo = `${baseUrl}/auth/callback`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw error;
  redirect(data.url);
}

export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createServerSupabaseClient();
  const baseUrl = "https://gojee.vercel.app";
  const redirectTo = `${baseUrl}/auth/callback`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
  return { success: true };
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
