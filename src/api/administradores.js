import { apiRequest } from "./http.js";
import { getSupabaseClient } from "./supabaseClient.js";

const SESSION_KEY = "imperatriz:admin-session";

function readCachedAdmin() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCachedAdmin(admin) {
  if (admin) localStorage.setItem(SESSION_KEY, JSON.stringify(admin));
}

function clearCachedAdmin() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

function normalizeCredentials({ email, senha, password }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPassword = String(password || senha || "");

  if (!normalizedEmail || !normalizedPassword) {
    throw new Error("Email e senha sao obrigatorios.");
  }

  return { email: normalizedEmail, password: normalizedPassword };
}

async function signInSupabase(email, password) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw error;
  if (!data?.session?.access_token) {
    throw new Error("Supabase nao retornou uma sessao valida.");
  }

  return data;
}

async function createServerSessionFromSupabase(session) {
  const response = await apiRequest("/api/admin/login", {
    method: "POST",
    body: { accessToken: session.access_token },
  });

  if (!response?.admin) {
    throw new Error("Servidor nao confirmou permissao administrativa.");
  }

  saveCachedAdmin(response.admin);
  return response.admin;
}

export async function autenticarAdministrador(credentials) {
  const { email, password } = normalizeCredentials(credentials || {});

  try {
    const { session } = await signInSupabase(email, password);
    return await createServerSessionFromSupabase(session);
  } catch (authError) {
    const canTryLegacyBootstrap = authError?.message === "Invalid login credentials";
    if (!canTryLegacyBootstrap) {
      clearCachedAdmin();
      try {
        await getSupabaseClient().auth.signOut();
        await apiRequest("/api/admin/logout", { method: "POST" });
      } catch {
        // Best-effort cleanup after a rejected admin validation.
      }

      console.error("Erro login:", authError?.message || authError);
      throw new Error(authError?.message || "Nao foi possivel entrar.");
    }
  }

  try {
    const legacyResponse = await apiRequest("/api/admin/login", {
      method: "POST",
      body: { email, senha: password },
    });

    const { session } = await signInSupabase(email, password);
    await createServerSessionFromSupabase(session);
    saveCachedAdmin(legacyResponse.admin);
    return legacyResponse.admin;
  } catch (err) {
    clearCachedAdmin();
    try {
      await getSupabaseClient().auth.signOut();
      await apiRequest("/api/admin/logout", { method: "POST" });
    } catch {
      // Best-effort cleanup after a failed login attempt.
    }

    console.error("Erro login:", err?.message || err);
    throw new Error(err?.message || "Nao foi possivel entrar.");
  }
}

export async function getAdministradorAutenticado({ force = false } = {}) {
  const cached = readCachedAdmin();
  if (cached && !force) return cached;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (data?.session?.access_token) {
      return await createServerSessionFromSupabase(data.session);
    }

    const response = await apiRequest("/api/admin/session");
    if (response?.admin) {
      saveCachedAdmin(response.admin);
      return response.admin;
    }

    clearCachedAdmin();
    return null;
  } catch {
    clearCachedAdmin();
    return null;
  }
}

export function isAdministradorAutenticado() {
  return Boolean(readCachedAdmin());
}

export async function logoutAdministrador() {
  clearCachedAdmin();

  try {
    await getSupabaseClient().auth.signOut();
  } catch (error) {
    console.error("Erro logout Supabase:", error?.message || error);
  }

  await apiRequest("/api/admin/logout", { method: "POST" });
}

export async function getQuantidadeAdministradores() {
  const response = await apiRequest("/api/admin/bootstrap-status");
  return Number(response?.totalAdministradores || 0);
}
