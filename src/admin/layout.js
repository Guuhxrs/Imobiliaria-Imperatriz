import { logoutAdministrador } from "../api/administradores.js";

export function setFeedback(element, message, type = "info") {
  if (!element) return;
  element.textContent = message;
  element.className = `feedback feedback-${type}`;
}

export function renderAdminLayout({ active, title, subtitle, session, actions = "", content }) {
  const navItems = [
    { id: "imoveis", label: "Imóveis", href: "./imoveis.html" },
    { id: "mensagens", label: "Mensagens", href: "./mensagens.html" },
  ];

  const navHtml = navItems
    .map(
      (item) => `
      <a href="${item.href}" class="${active === item.id ? "active" : ""}">${item.label}</a>
    `
    )
    .join("");

  return `
    <div class="admin-layout">
      <header class="admin-header">
        <div class="admin-brand">
          <a href="../index.html">Imperatriz Imóveis</a>
          <span class="admin-badge">Admin</span>
        </div>
        <nav class="admin-nav">
          ${navHtml}
        </nav>
        <div class="admin-user">
          <span>${session?.nome || "Admin"}</span>
          <button type="button" id="btn-logout" class="ghost-button">Sair</button>
        </div>
      </header>

      <main class="admin-main">
        <div class="page-header">
          <div>
            <h1>${title}</h1>
            ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ""}
          </div>
          ${actions ? `<div class="page-actions">${actions}</div>` : ""}
        </div>

        <div class="page-content">
          ${content}
        </div>
      </main>
    </div>
  `;
}

export function bindAdminLayout() {
  document.getElementById("btn-logout")?.addEventListener("click", () => {
    logoutAdministrador();
    window.location.replace("./login.html");
  });
}

export function bindAdminLayoutEvents() {
  bindAdminLayout();
}