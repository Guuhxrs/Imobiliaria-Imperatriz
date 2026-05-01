import { getImoveis } from "../api/imoveis.js";
import { getContatos } from "../api/contatos.js";
import { renderAdminLayout, bindAdminLayout } from "./layout.js";
import { requireAdminAccess } from "./access.js";
import { formatCurrencyBRL } from "../utils/helpers.js";

let session = null;

function renderPage(stats) {
  return renderAdminLayout({
    active: "dashboard",
    title: "Dashboard",
    subtitle: "Resumo geral do seu catálogo.",
    session,
    content: `
      <div class="dashboard-cards">
        <article class="dashboard-card accent-blue">
          <span>Imóveis cadastrados</span>
          <strong>${stats.totalImoveis}</strong>
        </article>
        <article class="dashboard-card accent-green">
          <span>Disponíveis</span>
          <strong>${stats.imoveisDisponiveis}</strong>
        </article>
        <article class="dashboard-card accent-orange">
          <span>Mensagens</span>
          <strong>${stats.totalContatos}</strong>
        </article>
        <article class="dashboard-card accent-pink">
          <span>Ticket médio</span>
          <strong>${formatCurrencyBRL(stats.ticketMedio)}</strong>
        </article>
      </div>

      <section class="quick-panel">
        <div>
          <span class="admin-kicker">Ações rápidas</span>
          <h2>Continue de onde parou</h2>
        </div>
        <div class="dashboard-links">
          <a href="./imoveis.html" class="dashboard-link">Gerenciar imóveis</a>
          <a href="./mensagens.html" class="dashboard-link">Ver mensagens</a>
          <a href="../index.html" class="dashboard-link">Abrir site</a>
        </div>
      </section>
    `,
  });
}

async function init() {
  session = await requireAdminAccess();
  if (!session) return;

  const app = document.getElementById("admin-app");
  if (!app) return;

  try {
    const imoveis = await getImoveis({ limit: 1000 });
    const contatos = await getContatos();
    const totalValor = imoveis.reduce((sum, item) => sum + Number(item.preco || 0), 0);

    const stats = {
      totalImoveis: imoveis.length,
      imoveisDisponiveis: imoveis.filter((item) => item.status === "disponivel").length,
      totalContatos: contatos.length,
      ticketMedio: imoveis.length ? totalValor / imoveis.length : 0,
    };

    app.innerHTML = renderPage(stats);
    bindAdminLayout();
  } catch (error) {
    console.error(error);
    app.innerHTML = '<main class="admin-main"><p>Erro ao carregar dashboard.</p></main>';
  }
}

document.addEventListener("DOMContentLoaded", init);
