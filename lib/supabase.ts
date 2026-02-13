import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function getSupabase() {
  if (!url || !anonKey) throw new Error("Supabase URL and anon key are required");
  return createClient(url, anonKey);
}

export function getSupabaseService() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase URL and service role key are required");
  return createClient(url, key, { auth: { persistSession: false } });
}
