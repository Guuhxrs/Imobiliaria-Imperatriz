function getBaseUrl() {
  const runtime = globalThis.__APP_CONFIG__;
  if (!runtime || typeof runtime !== "object") return "";
  const url = String(runtime.API_BASE_URL || "").trim().replace(/\/$/, "");
  return url;
}

function buildUrl(path) {
  const base = getBaseUrl();
  if (!base) {
    return path;
  }
  return `${base}${path}`;
}

export async function apiRequest(path, { method = "GET", body, headers = {} } = {}) {
  const response = await fetch(buildUrl(path), {
    method,
    credentials: "include",
    headers: {
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body == null ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.error || "Erro ao comunicar com o servidor.");
  }

  return payload;
}
