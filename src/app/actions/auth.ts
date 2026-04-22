export async function loginWithGoogle() {
  const supabase = await createServerSupabaseClient();
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://gojee.vercel.app";
  const redirectTo = `${baseUrl}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });
  if (error) throw error;
  redirect(data.url);
}
