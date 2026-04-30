import { getImovelById } from "../api/imoveis.js";
import { renderNavbar } from "../components/navbar.js";
import { escapeHtml, formatCurrencyBRL } from "../utils/helpers.js";

function renderImagemDetalhes(imovel) {
  if (!imovel.imagem_capa) {
    return '<div class="imagem-indisponivel imagem-detalhes">Imagem indisponível</div>';
  }

  return `<img src="${escapeHtml(imovel.imagem_capa)}" alt="${escapeHtml(imovel.titulo)}" />`;
}

export async function renderDetalhesPage(id) {
  const safeId = id ? decodeURIComponent(id) : null;
  if (!safeId) {
    return `${renderNavbar("imoveis")}<main class="container"><h1>Imóvel não encontrado</h1></main>`;
  }

  const imovel = await getImovelById(safeId);

  return `
    ${renderNavbar("imoveis")}
    <main class="container">
      <a class="btn-link" href="#imoveis" data-route="imoveis">← Voltar</a>
      <article class="detalhes">
        ${renderImagemDetalhes(imovel)}
        <h1>${escapeHtml(imovel.titulo)}</h1>
        <p class="price">${formatCurrencyBRL(imovel.preco)}</p>
        <p>${escapeHtml(imovel.descricao || "Sem descrição")}</p>
        <ul>
          <li>Cidade: ${escapeHtml(imovel.cidade || "-")}</li>
          <li>Bairro: ${escapeHtml(imovel.bairro || "-")}</li>
          <li>Quartos: ${imovel.quartos || 0}</li>
          <li>Banheiros: ${imovel.banheiros || 0}</li>
          <li>Área: ${imovel.area || 0} m²</li>
        </ul>
      </article>
    </main>
  `;
}
