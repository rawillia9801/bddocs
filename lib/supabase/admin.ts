import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secret) throw new Error("Purchase recording is not configured in the deployment environment.");
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
