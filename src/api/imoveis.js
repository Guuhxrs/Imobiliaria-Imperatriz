import { apiRequest } from "./http.js";

export async function getImoveis({ limit, cidade, tipo, status, search, tipo_negocio } = {}) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit);
  if (cidade) params.set("cidade", cidade);
  if (tipo) params.set("tipo", tipo);
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  if (tipo_negocio) params.set("tipo_negocio", tipo_negocio);

  const query = params.toString();
  const payload = await apiRequest(`/api/imoveis${query ? `?${query}` : ""}`);
  return payload.imoveis || [];
}

export async function getImovelById(id) {
  const payload = await apiRequest(`/api/imoveis/${encodeURIComponent(id)}`);
  return payload.imovel;
}

export async function getImoveisAdmin({ limit, cidade, tipo, status, search } = {}) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit);
  if (cidade) params.set("cidade", cidade);
  if (tipo) params.set("tipo", tipo);
  if (status) params.set("status", status);
  if (search) params.set("search", search);

  const query = params.toString();
  const payload = await apiRequest(`/api/admin/imoveis${query ? `?${query}` : ""}`);
  return payload.imoveis || [];
}

export async function getImovelByIdAdmin(id) {
  const payload = await apiRequest(`/api/admin/imoveis/${encodeURIComponent(id)}`);
  return payload.imovel;
}

export async function criarImovel(payload, { imageUrls = [] } = {}) {
  const response = await apiRequest("/api/admin/imoveis", {
    method: "POST",
    body: { ...payload, imageUrls },
  });

  return response.imovel;
}

export async function atualizarImovel(id, payload, { imageUrls } = {}) {
  const response = await apiRequest(`/api/admin/imoveis/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: { ...payload, imageUrls },
  });

  return response.imovel;
}

export async function removerImovel(id) {
  await apiRequest(`/api/admin/imoveis/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return true;
}

export async function uploadImagemImovel(file, { imovelId = "novo-imovel" } = {}) {
  const body = new FormData();
  body.append("imagem", file);
  body.append("folder", imovelId);

  const response = await apiRequest("/api/admin/upload", {
    method: "POST",
    body,
  });

  return response.url;
}
