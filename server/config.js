import dotenv from "dotenv";

dotenv.config();

function readRequired(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new Error(`Variavel obrigatoria ausente: ${name}`);
  }
  return value;
}

export const config = Object.freeze({
  port: Number(process.env.PORT || 3000),
  supabaseUrl: readRequired("SUPABASE_URL"),
  supabaseServiceRoleKey: readRequired("SUPABASE_SERVICE_ROLE_KEY"),
  sessionSecret: readRequired("SESSION_SECRET"),
  storageBucket: String(process.env.SUPABASE_STORAGE_BUCKET || "").trim(),
  isProduction: process.env.NODE_ENV === "production",
});
