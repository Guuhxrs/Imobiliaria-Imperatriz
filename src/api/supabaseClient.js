import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEFAULT_CONFIG = {
  SUPABASE_URL: "https://ufazfuvdriwchfekqttw.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmYXpmdXZkcml3Y2hmZWtxdHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2OTI0MDAsImV4cCI6MjA1MjI2ODQwMH0.VS1NpZOoO8c0mFb1d4jDgO5gT3ZLV1fV5dJZV8A9g6E",
};

let client;

function getConfig() {
  const runtime = globalThis?.__APP_CONFIG__ || {};
  return {
    SUPABASE_URL: runtime.SUPABASE_URL || DEFAULT_CONFIG.SUPABASE_URL,
    SUPABASE_ANON_KEY: runtime.SUPABASE_ANON_KEY || DEFAULT_CONFIG.SUPABASE_ANON_KEY,
  };
}

export function getSupabaseClient() {
  if (client) return client;

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getConfig();
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase credentials not configured. Client not created.");
    return null;
  }

  try {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  } catch (e) {
    console.error("Erro ao criar Supabase client:", e);
    return null;
  }

  return client;
}
