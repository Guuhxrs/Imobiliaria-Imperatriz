import { parseHashRoute } from "./utils/helpers.js";
import { renderHomePage } from "./pages/home.js";
import { renderImoveisPage } from "./pages/imoveis.js";
import { renderDetalhesPage } from "./pages/detalhes.js";
import { bindContatoPageEvents, renderContatoPage } from "./pages/contato.js";
import { bindAdminPageEvents, renderAdminPage } from "./pages/admin.js";
import { bindAdminLoginEvents, renderAdminLoginPage } from "./pages/adminLogin.js";
import { isAdministradorAutenticado } from "./api/administradores.js";

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
    else if (page === "admin-login") html = renderAdminLoginPage();
    else if (page === "admin") {
      if (!isAdministradorAutenticado()) {
        window.location.hash = "#admin-login";
        return;
      }
      html = await renderAdminPage();
    } else html = await renderNotFound();

    app.innerHTML = html;

    if (page === "contato") bindContatoPageEvents();
    if (page === "admin") bindAdminPageEvents();
    if (page === "admin-login") bindAdminLoginEvents();
  } catch (error) {
    console.error("[Router] Falha ao renderizar rota:", error);
    app.innerHTML = '<main class="container"><h1>Erro ao carregar a página.</h1></main>';
  }
}

export async function initRouter() {
  if (!window.location.hash) {
    window.location.hash = "#home";
  }

  window.addEventListener("hashchange", () => {
    renderCurrentRoute().catch(e => console.error("Erro no hashchange:", e));
  });
  
  try {
    await renderCurrentRoute();
  } catch (e) {
    console.error("Erro no renderCurrentRoute inicial:", e);
  }
}
