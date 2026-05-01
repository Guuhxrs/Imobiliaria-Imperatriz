import { getImoveis } from "../api/imoveis.js";
import { renderCardImovel } from "../components/cardImovel.js";
import { renderNavbar } from "../components/navbar.js";
import { escapeHtml } from "../utils/helpers.js";

function getTituloPagina(tipo) {
  return tipo === "aluguel" ? "Imóveis para alugar" : "Imóveis à venda";
}

function buildSubtitle({ cidadeFiltro, searchFiltro, tipoImovel }) {
  const filtros = [cidadeFiltro || searchFiltro, tipoImovel].filter(Boolean);
  if (!filtros.length) return "Lista sempre atualizada com os imóveis disponíveis.";
  return `Filtros ativos: ${filtros.map(escapeHtml).join(" · ")}`;
}

export async function renderImoveisPage() {
  const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const tipoNegocio = params.get("negocio") || params.get("tipo") || "venda";
  const cidadeFiltro = params.get("cidade") || "";
  const searchFiltro = params.get("search") || "";
  const tipoImovel = params.get("tipo_imovel") || "";

  const imoveis = await getImoveis({
    limit: 48,
    tipo_negocio: tipoNegocio,
    tipo: tipoImovel || undefined,
    cidade: cidadeFiltro || undefined,
    search: searchFiltro || undefined,
    status: "disponivel",
  });

  return `
    ${renderNavbar("imoveis")}
    <main class="container imoveis-page">
      <section class="imoveis-header">
        <span class="section-kicker">Resultados</span>
        <h1>${getTituloPagina(tipoNegocio)}</h1>
        <p>${imoveis.length} imóvel(is) encontrado(s). ${buildSubtitle({ cidadeFiltro, searchFiltro, tipoImovel })}</p>
      </section>

      <div class="imoveis-tabs" aria-label="Tipo de negociação">
        <a href="#imoveis?tipo=venda" class="tab ${tipoNegocio === "venda" ? "active" : ""}">Comprar</a>
        <a href="#imoveis?tipo=aluguel" class="tab ${tipoNegocio === "aluguel" ? "active" : ""}">Alugar</a>
      </div>

      ${imoveis.length > 0 ? `
        <section class="grid-cards">
          ${imoveis.map(renderCardImovel).join("")}
        </section>
      ` : `
        <section class="imoveis-empty">
          <h2>Nenhum imóvel encontrado por aqui.</h2>
          <p>Limpe os filtros ou fale com a equipe para receber uma curadoria manual.</p>
          <div class="cta-buttons">
            <a href="#imoveis?tipo=${tipoNegocio}" class="btn-primary">Limpar filtros</a>
            <a href="#contato" class="btn-outline">Pedir ajuda</a>
          </div>
        </section>
      `}
    </main>
  `;
}
