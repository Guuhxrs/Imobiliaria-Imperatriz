import { getAdministradorAutenticado } from "../api/administradores.js";

export function buildAdminUrl(path) {
  return new URL(path, window.location.href).toString();
}

export function redirectToLogin() {
  const loginUrl = new URL("./login.html", window.location.href);
  loginUrl.searchParams.set("next", `${window.location.pathname}${window.location.search}`);
  window.location.replace(loginUrl.toString());
}

export function redirectToDashboard() {
  window.location.replace(buildAdminUrl("./dashboard.html"));
}

export async function requireAdminAccess() {
  try {
    const session = await getAdministradorAutenticado({ force: true });
    if (!session) {
      redirectToLogin();
      return null;
    }
    return session;
  } catch (error) {
    console.error("Erro ao verificar admin:", error);
    redirectToLogin();
    return null;
  }
}

export function getRedirectAfterLogin() {
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next) return buildAdminUrl("./dashboard.html");

  try {
    const candidate = new URL(next, window.location.origin);
    if (candidate.origin === window.location.origin && candidate.pathname.includes("/admin/")) {
      return candidate.toString();
    }
  } catch {
    return buildAdminUrl("./dashboard.html");
  }

  return buildAdminUrl("./dashboard.html");
}
