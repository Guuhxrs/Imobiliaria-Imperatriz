import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEFAULT_CONFIG = {
  SUPABASE_URL: "https://ufazfuvdriwchfekqttw.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmYXpmdXZkcml3Y2hmZWtxdHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2OTI0MDAsImV4cCI6MjA1MjI2ODQwMH0.VS1NpZOoO8c0mFb1d4jDgO5gT3ZLV1fV5dJZV8A9g6E",
};

let client;

function getConfig() {
  const runtime = (typeof window !== "undefined" && window.__APP_CONFIG__) || {};
  
  console.log("[SupabaseClient] window.__APP_CONFIG__:", runtime);
  console.log("[SupabaseClient] DEFAULT_CONFIG:", DEFAULT_CONFIG);
  
  return {
    SUPABASE_URL: runtime.SUPABASE_URL || DEFAULT_CONFIG.SUPABASE_URL,
    SUPABASE_ANON_KEY: runtime.SUPABASE_ANON_KEY || DEFAULT_CONFIG.SUPABASE_ANON_KEY,
  };
}

export function getSupabaseClient() {
  if (client) {
    console.log("[SupabaseClient] Retornando cliente cacheado");
    return client;
  }

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getConfig();
  
  console.log("[SupabaseClient] Config:", { SUPABASE_URL, SUPABASE_ANON_KEY: SUPABASE_ANON_KEY?.substring(0, 20) + "..." });
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("[SupabaseClient] ERRO: Credenciais não configuradas!");
    throw new Error("Supabase credentials not configured. Verifique app-config.js");
  }

  try {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    console.log("[SupabaseClient] Cliente criado com sucesso");
  } catch (e) {
    console.error("[SupabaseClient] ERRO ao criar cliente:", e);
    throw e;
  }

  return client;
}
