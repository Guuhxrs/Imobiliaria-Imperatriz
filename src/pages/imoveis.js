import { getImoveis } from "../api/imoveis.js";
import { renderCardImovel } from "../components/cardImovel.js";
import { renderNavbar } from "../components/navbar.js";

function getTipoNegocioFromUrl() {
  const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
  return params.get("tipo") || "venda";
}

function getTituloPagina(tipo) {
  return tipo === "aluguel" ? "Imóveis para Alugar" : "Imóveis à Venda";
}

export async function renderImoveisPage() {
  const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const tipoNegocio = params.get("tipo") || "venda";
  const cidadeFiltro = params.get("cidade") || "";
  const searchFiltro = params.get("search") || "";

  const imoveis = await getImoveis({ 
    limit: 48,
    tipo_negocio: tipoNegocio,
    cidade: cidadeFiltro || undefined,
    search: searchFiltro || undefined,
    status: "disponivel"
  });

  return `
    ${renderNavbar("imoveis")}
    <main class="container imoveis-page">
      <section class="imoveis-header">
        <h1>${getTituloPagina(tipoNegocio)}</h1>
        <p>${imoveis.length} imóvel(is) encontrado(s)</p>
      </section>
      
      <div class="imoveis-tabs">
        <a href="#imoveis?tipo=venda" class="tab ${tipoNegocio === "venda" ? "active" : ""}">
          Comprar
        </a>
        <a href="#imoveis?tipo=aluguel" class="tab ${tipoNegocio === "aluguel" ? "active" : ""}">
          Alugar
        </a>
      </div>

      ${imoveis.length > 0 ? `
        <section class="grid-cards">
          ${imoveis.map(renderCardImovel).join("")}
        </section>
      ` : `
        <div class="imoveis-empty">
          <p>Nenhum imóvel encontrado para esta categoria.</p>
          <a href="#imoveis" class="btn-primary">Ver todos os imóveis</a>
        </div>
      `}
    </main>
  `;
}
