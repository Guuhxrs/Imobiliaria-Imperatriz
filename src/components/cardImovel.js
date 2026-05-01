import { escapeHtml, formatCurrencyBRL } from "../utils/helpers.js";

function renderImagem(imovel) {
  if (!imovel.imagem_capa) {
    return '<div class="imagem-indisponivel">Foto em breve</div>';
  }

  return `<img src="${escapeHtml(imovel.imagem_capa)}" alt="${escapeHtml(imovel.titulo)}" loading="lazy" />`;
}

function renderStatus(imovel) {
  const tipo = imovel.tipo_negocio === "aluguel" ? "Aluguel" : imovel.tipo_negocio === "ambos" ? "Venda ou aluguel" : "Venda";
  return `<span class="card-tag">${tipo}</span>`;
}

export function renderCardImovel(imovel) {
  return `
    <article class="card-imovel">
      <a href="#detalhes/${encodeURIComponent(imovel.id)}" class="card-media" data-route="detalhes/${encodeURIComponent(imovel.id)}">
        ${renderImagem(imovel)}
        ${renderStatus(imovel)}
      </a>
      <div class="card-body">
        <p class="meta">${escapeHtml(imovel.bairro || "Bairro a consultar")}${imovel.cidade ? `, ${escapeHtml(imovel.cidade)}` : ""}</p>
        <h3>${escapeHtml(imovel.titulo)}</h3>
        <p class="price">${formatCurrencyBRL(imovel.preco)}</p>
        <div class="attrs" aria-label="Características do imóvel">
          <span>${imovel.quartos || 0} quartos</span>
          <span>${imovel.banheiros || 0} banheiros</span>
          <span>${imovel.area || 0} m²</span>
        </div>
        <a href="#detalhes/${encodeURIComponent(imovel.id)}" class="btn-link" data-route="detalhes/${encodeURIComponent(imovel.id)}">Ver detalhes</a>
      </div>
    </article>
  `;
}
