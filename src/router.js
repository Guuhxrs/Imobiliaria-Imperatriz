import { parseHashRoute } from "./utils/helpers.js";
import { renderHomePage } from "./pages/home.js";
import { renderImoveisPage } from "./pages/imoveis.js";
import { renderDetalhesPage } from "./pages/detalhes.js";
import { bindContatoPageEvents, renderContatoPage } from "./pages/contato.js";
import { renderSobrePage } from "./pages/sobre.js";
import { getAdministradorAutenticado } from "./api/administradores.js";
import { initCarousel } from "./components/carousel.js";
import { initCarrosselImoveis } from "./components/carrosselImoveis.js";
import { initSearchBar } from "./components/searchBar.js";

function getApp() {
  const app = document.getElementById("app");
  if (!app) throw new Error("Elemento #app não encontrado.");
  return app;
}

async function renderNotFound() {
  return '<main class="container"><h1>Página não encontrada</h1></main>';
}

export async function renderCurrentRoute() {
  const app = getApp();
  const { page, id } = parseHashRoute(window.location.hash);

  try {
    let html = "";

    if (page === "home") html = await renderHomePage();
    else if (page === "imoveis") html = await renderImoveisPage();
    else if (page === "detalhes") html = await renderDetalhesPage(id);
    else if (page === "contato") html = renderContatoPage();
    else if (page === "sobre") html = renderSobrePage();
    else if (page === "admin-login") {
      window.location.href = "./admin/login.html";
      return;
    }
    else if (page === "admin") {
      const admin = await getAdministradorAutenticado({ force: true });
      if (!admin) {
        window.location.href = "./admin/login.html";
        return;
      }
      window.location.href = "./admin/dashboard.html";
      return;
    } else html = await renderNotFound();

    app.innerHTML = html;

    if (page === "home") {
      initCarousel();
      initSearchBar();
      initCarrosselImoveis("vendaTrack");
      initCarrosselImoveis("recentesTrack");
    }
    if (page === "contato") bindContatoPageEvents();
  } catch (error) {
    console.error("[Router] Falha ao renderizar rota:", error);
    app.innerHTML = '<main class="container"><h1>Ops! Não foi possível carregar esta página.</h1></main>';
  }
}

export async function initRouter() {
  if (!window.location.hash) {
    window.location.hash = "#home";
  }

  window.addEventListener("hashchange", () => {
    renderCurrentRoute().catch((error) => console.error("Erro no hashchange:", error));
  });

  await renderCurrentRoute();
}
