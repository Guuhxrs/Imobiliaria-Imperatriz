import { apiRequest } from "./http.js";

export async function criarContato(payload) {
  const response = await apiRequest("/api/contatos", {
    method: "POST",
    body: payload,
  });

  return response.contato;
}

export async function getContatos() {
  const response = await apiRequest("/api/admin/contatos");
  return response.contatos || [];
}

export async function atualizarContatoStatus(id, respondido) {
  const response = await apiRequest(`/api/admin/contatos/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: { respondido },
  });

  return response.contato;
}

export async function limparContatosAntigos() {
  const response = await apiRequest(`/api/admin/contatos/limpar`, {
    method: "DELETE",
  });

  return response.removidos || 0;
}
