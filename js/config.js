const SAFE_FALLBACK_CONFIG = Object.freeze({
  SUPABASE_URL: "https://ufazfuvdriwchfekqttw.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmYXpmdXZkcml3Y2hmZWtxdHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2OTI0MDAsImV4cCI6MjA1MjI2ODQwMH0.VS1NpZOoO8c0mFb1d4jDgO5gT3ZLV1fV5dJZV8A9g6E",
});

function readWindowConfig() {
  if (typeof window === "undefined") return {};

  const appConfig = window.__APP_CONFIG__;
  return appConfig && typeof appConfig === "object" ? appConfig : {};
}

export function getConfig(overrides = {}) {
  const windowConfig = readWindowConfig();

  const runtimeConfig = {
    SUPABASE_URL:
      overrides.SUPABASE_URL ??
      windowConfig.SUPABASE_URL ??
      SAFE_FALLBACK_CONFIG.SUPABASE_URL,
    SUPABASE_ANON_KEY:
      overrides.SUPABASE_ANON_KEY ??
      windowConfig.SUPABASE_ANON_KEY ??
      SAFE_FALLBACK_CONFIG.SUPABASE_ANON_KEY,
  };

  if (!runtimeConfig.SUPABASE_URL || !runtimeConfig.SUPABASE_ANON_KEY) {
    throw new Error("Supabase config inválida. Verifique window.__APP_CONFIG__ ou os overrides.");
  }

  return Object.freeze(runtimeConfig);
}

export { SAFE_FALLBACK_CONFIG };
