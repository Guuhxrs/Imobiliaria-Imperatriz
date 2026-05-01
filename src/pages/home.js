import { getImoveis } from "../api/imoveis.js";
import { renderNavbar } from "../components/navbar.js";
import { renderCarousel } from "../components/carousel.js";
import { renderCarrosselImoveis } from "../components/carrosselImoveis.js";
import { renderSearchBar } from "../components/searchBar.js";
import { renderWhatsAppFloat } from "../components/whatsAppFloat.js";
import { renderDepoimentos } from "../components/depoimentos.js";

function renderStats(imoveis) {
  const cidades = new Set(imoveis.map((item) => item.cidade).filter(Boolean));
  const venda = imoveis.filter((item) => ["venda", "ambos"].includes(item.tipo_negocio)).length;
  const aluguel = imoveis.filter((item) => ["aluguel", "ambos"].includes(item.tipo_negocio)).length;

  return `
    <section class="home-stats" aria-label="Resumo do catálogo">
      <div><strong>${imoveis.length}</strong><span>imóveis no catálogo</span></div>
      <div><strong>${cidades.size || 1}</strong><span>regiões atendidas</span></div>
      <div><strong>${venda}</strong><span>opções para comprar</span></div>
      <div><strong>${aluguel}</strong><span>opções para alugar</span></div>
    </section>
  `;
}

export async function renderHomePage() {
  let imoveis = [];
  try {
    imoveis = await getImoveis({ limit: 20 }) || [];
  } catch (error) {
    console.error("Erro ao carregar imóveis:", error);
  }

  const disponiveis = Array.isArray(imoveis) ? imoveis.filter((item) => item.status === "disponivel") : [];
  const recentes = Array.isArray(imoveis) ? imoveis.slice(0, 8) : [];

  return `
    ${renderNavbar("home")}
    <main class="home-main">
      ${renderCarousel()}
      <div class="container">
        ${renderSearchBar()}
        ${renderStats(disponiveis)}
        ${renderCarrosselImoveis(disponiveis, "Imóveis disponíveis", "vendaTrack")}
        ${renderCarrosselImoveis(recentes, "Novidades do catálogo", "recentesTrack")}
        ${renderDepoimentos()}
        <section class="cta-sobre">
          <span class="section-kicker">Atendimento humano</span>
          <h2>Conte o que você procura. A gente traduz em bons imóveis.</h2>
          <p>Nossa equipe cruza seu momento, orçamento e bairro desejado com o catálogo real do sistema.</p>
          <div class="cta-buttons">
            <a href="#contato" class="btn-primary">Fale conosco</a>
            <a href="https://wa.me/5512996089901" target="_blank" rel="noreferrer" class="btn-outline">WhatsApp</a>
          </div>
        </section>
      </div>
      ${renderWhatsAppFloat()}
    </main>
  `;
}
