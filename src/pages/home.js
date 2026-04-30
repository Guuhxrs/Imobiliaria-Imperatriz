import { getImoveis } from "../api/imoveis.js";
import { renderNavbar } from "../components/navbar.js";
import { renderCarousel } from "../components/carousel.js";
import { renderCarrosselImoveis } from "../components/carrosselImoveis.js";
import { renderSearchBar, initSearchBar } from "../components/searchBar.js";
import { renderWhatsAppFloat } from "../components/whatsAppFloat.js";
import { renderDepoimentos } from "../components/depoimentos.js";

export async function renderHomePage() {
  let imoveis = [];
  try {
    imoveis = await getImoveis({ limit: 20 }) || [];
  } catch (e) {
    console.error("Erro ao carregar imóveis:", e);
  }
  
  const disponiveis = Array.isArray(imoveis) ? imoveis.filter((item) => item.status === "disponivel") : [];
  const recentes = Array.isArray(imoveis) ? imoveis.slice(0, 8) : [];

  setTimeout(() => {
    try { initSearchBar(); } catch (e) { console.error("Erro initSearchBar:", e); }
  }, 100);

  return `
    ${renderNavbar("home")}
    <main class="container home-main">
      ${renderCarousel()}
      ${renderSearchBar()}
      ${renderCarrosselImoveis(disponiveis, "Imóveis disponíveis", "vendaTrack")}
      ${renderCarrosselImoveis(recentes, "Novidades do catálogo", "aluguelTrack")}
      ${renderDepoimentos()}
      ${renderWhatsAppFloat()}
      <section class="cta-sobre">
        <h2>Faça um orçamento ou tire suas dúvidas</h2>
        <p>Nossa equipe está pronta para atendê-lo com excelência.</p>
        <div class="cta-buttons">
          <button id="btn-contato" onclick="window.location.hash='#contato'" class="btn-primary">Fale conosco</button>
          <button id="btn-whatsapp" onclick="window.open('https://wa.me/5512996089901', '_blank')" class="btn-outline">WhatsApp</button>
        </div>
      </section>
    </main>
  `;
}
