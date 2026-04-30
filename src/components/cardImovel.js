import { escapeHtml, formatCurrencyBRL } from "../utils/helpers.js";

function renderImagem(imovel) {
  if (!imovel.imagem_capa) {
    return '<div class="imagem-indisponivel">Imagem indisponível</div>';
  }

  return `<img src="${escapeHtml(imovel.imagem_capa)}" alt="${escapeHtml(imovel.titulo)}" loading="lazy" />`;
}

export function renderCardImovel(imovel) {
  return `
    <article class="card-imovel">
      ${renderImagem(imovel)}
      <div class="card-body">
        <h3>${escapeHtml(imovel.titulo)}</h3>
        <p class="price">${formatCurrencyBRL(imovel.preco)}</p>
        <p class="meta">${escapeHtml(imovel.bairro || "")}${imovel.cidade ? `, ${escapeHtml(imovel.cidade)}` : ""}</p>
        <p class="desc">${escapeHtml(imovel.descricao || "Sem descrição")}</p>
        <div class="attrs">
          <span>${imovel.quartos || 0} qts</span>
          <span>${imovel.banheiros || 0} banhos</span>
          <span>${imovel.area || 0} m²</span>
        </div>
        <a href="#detalhes/${encodeURIComponent(imovel.id)}" class="btn-link" data-route="detalhes/${encodeURIComponent(imovel.id)}">Ver detalhes</a>
      </div>
    </article>
  `;
}
