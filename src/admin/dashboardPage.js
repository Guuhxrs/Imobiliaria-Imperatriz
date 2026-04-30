import { getImoveis } from "../api/imoveis.js";
import { getContatos } from "../api/contatos.js";
import { renderAdminLayout, bindAdminLayout, setFeedback } from "./layout.js";
import { requireAdminAccess } from "./access.js";

let session = null;

function renderPage(stats) {
  return renderAdminLayout({
    active: "dashboard",
    title: "Dashboard",
    subtitle: "Visão geral do sistema",
    session,
    content: `
      <div class="dashboard-cards">
        <div class="dashboard-card">
          <h3>Imóveis Cadastrados</h3>
          <p class="dashboard-number">${stats.totalImoveis}</p>
        </div>
        <div class="dashboard-card">
          <h3>Imóveis Disponíveis</h3>
          <p class="dashboard-number">${stats.imoveisDisponiveis}</p>
        </div>
        <div class="dashboard-card">
          <h3>Mensagens Recebidas</h3>
          <p class="dashboard-number">${stats.totalContatos}</p>
        </div>
        <div class="dashboard-card">
          <h3>Mensagens Pendentes</h3>
          <p class="dashboard-number">${stats.contatosPendentes}</p>
        </div>
      </div>
      <div class="dashboard-links">
        <a href="./imoveis.html" class="dashboard-link">Gerenciar Imóveis</a>
        <a href="./mensagens.html" class="dashboard-link">Ver Mensagens</a>
      </div>
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

    const stats = {
      totalImoveis: imoveis.length,
      imoveisDisponiveis: imoveis.filter(i => i.status === "disponivel").length,
      totalContatos: contatos.length,
      contatosPendentes: contatos.filter(c => !c.respondido).length,
    };

    app.innerHTML = renderPage(stats);
    bindAdminLayout();
  } catch (error) {
    console.error(error);
    app.innerHTML = "<p>Erro ao carregar dashboard.</p>";
  }
}

document.addEventListener("DOMContentLoaded", init);