import { getSupabaseClient } from "./supabaseClient.js";

const SESSION_KEY = "imperatriz:admin-session";

async function sha256(text) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashSenha(senha) {
  return sha256(String(senha || ""));
}

export async function autenticarAdministrador({ email, senha }) {
  console.log("[AdminAuth] Iniciando autenticação para:", email);
  
  const senhaHash = await hashSenha(senha);
  console.log("[AdminAuth] Hash da senha calculado:", senhaHash.substring(0, 20) + "...");
  
  const supabase = getSupabaseClient();
  console.log("[AdminAuth] Supabase client:", supabase ? "OK" : "NULO");

  if (!supabase) {
    throw new Error("Supabase não configurado. Contate o administrador.");
  }

  const { data, error } = await supabase
    .from("administradores")
    .select("id, email, nome, created_at")
    .eq("email", String(email || "").trim().toLowerCase())
    .eq("senha_hash", senhaHash)
    .single();

  console.log("[AdminAuth] Resultado query:", { data, error });

  if (error || !data) {
    console.error("[AdminAuth] Erro na query:", error);
    throw new Error("Credenciais inválidas para administrador.");
  }

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  return data;
}

export function getAdministradorAutenticado() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAdministradorAutenticado() {
  return Boolean(getAdministradorAutenticado());
}

export function logoutAdministrador() {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function getQuantidadeAdministradores() {
  const supabase = getSupabaseClient();
  if (!supabase) return 0;
  
  const { count, error } = await supabase
    .from("administradores")
    .select("*", { count: "exact", head: true });
  
  if (error) {
    console.error("Erro ao contar administradores:", error);
    return 0;
  }
  return count || 0;
}

export async function criarAdministrador({ email, senha, nome }) {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    throw new Error("Supabase não configurado. Contate o administrador.");
  }
  
  const senha_hash = await hashSenha(senha);

  const payload = {
    email: String(email || "").trim().toLowerCase(),
    senha_hash,
    nome: String(nome || "").trim(),
  };

  const { data, error } = await supabase
    .from("administradores")
    .insert(payload)
    .select("id, email, nome, created_at")
    .single();

  if (error) throw new Error(`Erro ao criar administrador: ${error.message}`);

  return data;
}
