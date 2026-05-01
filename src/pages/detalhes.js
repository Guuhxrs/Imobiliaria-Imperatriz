import { getImovelById } from "../api/imoveis.js";
import { renderNavbar } from "../components/navbar.js";
import { escapeHtml, formatCurrencyBRL } from "../utils/helpers.js";

function renderImagemDetalhes(imovel) {
  if (!imovel.imagem_capa) {
    return '<div class="imagem-indisponivel imagem-detalhes">Foto em breve</div>';
  }

  return `<img src="${escapeHtml(imovel.imagem_capa)}" alt="${escapeHtml(imovel.titulo)}" />`;
}

function renderGaleria(imovel) {
  const imagens = Array.isArray(imovel.imagens) ? imovel.imagens.slice(1, 5) : [];
  if (!imagens.length) return "";

  return `
    <div class="detalhes-thumbs">
      ${imagens.map((imagem) => `<img src="${escapeHtml(imagem.url)}" alt="${escapeHtml(imovel.titulo)}" />`).join("")}
    </div>
  `;
}

export async function renderDetalhesPage(id) {
  const safeId = id ? decodeURIComponent(id) : null;
  if (!safeId) {
    return `${renderNavbar("imoveis")}<main class="container"><h1>Ops! Este imóvel não está mais disponível.</h1></main>`;
  }

  const imovel = await getImovelById(safeId);
  const mensagem = encodeURIComponent(`Olá, quero saber mais sobre o imóvel: ${imovel.titulo}`);

  return `
    ${renderNavbar("imoveis")}
    <main class="container detalhes-page">
      <a class="btn-link back-link" href="#imoveis" data-route="imoveis">Voltar para imóveis</a>
      <article class="detalhes">
        <section class="detalhes-visual">
          ${renderImagemDetalhes(imovel)}
          ${renderGaleria(imovel)}
        </section>
        <section class="detalhes-copy">
          <span class="section-kicker">${escapeHtml(imovel.tipo || "Imóvel")}</span>
          <h1>${escapeHtml(imovel.titulo)}</h1>
          <p class="price detalhes-preco">${formatCurrencyBRL(imovel.preco)}</p>
          <p class="detalhes-local">${escapeHtml(imovel.bairro || "Bairro a consultar")}${imovel.cidade ? `, ${escapeHtml(imovel.cidade)}` : ""}</p>
          <div class="attrs detalhes-atributos">
            <span>${imovel.quartos || 0} quartos</span>
            <span>${imovel.banheiros || 0} banheiros</span>
            <span>${imovel.vagas || 0} vagas</span>
            <span>${imovel.area || 0} m²</span>
          </div>
          <p class="detalhes-texto">${escapeHtml(imovel.descricao || "Em breve com mais detalhes. Fale com a gente para saber mais sobre este imóvel!")}</p>
          <div class="cta-buttons">
            <a href="https://wa.me/5512996089901?text=${mensagem}" target="_blank" rel="noreferrer" class="btn-primary">Chamar no WhatsApp</a>
            <a href="#contato" class="btn-outline">Enviar mensagem</a>
          </div>
        </section>
      </article>
    </main>
  `;
}
