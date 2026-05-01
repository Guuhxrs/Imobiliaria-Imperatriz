import { logoutAdministrador } from "../api/administradores.js";

export function setFeedback(element, message, type = "info") {
  if (!element) return;
  element.textContent = message;
  element.className = `feedback feedback-${type}`;
}

export function renderAdminLayout({ active, title, subtitle, session, actions = "", content }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", href: "./dashboard.html" },
    { id: "imoveis", label: "Imóveis", href: "./imoveis.html" },
    { id: "mensagens", label: "Mensagens", href: "./mensagens.html" },
  ];

  const navHtml = navItems
    .map((item) => `
      <a href="${item.href}" class="${active === item.id ? "active" : ""}">${item.label}</a>
    `)
    .join("");

  return `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <a href="../index.html" class="admin-brand">
          <img src="../src/assets/logo.jpg" alt="Imperatriz Imóveis" />
          <span>
            <strong>Imperatriz</strong>
            <small>Painel admin</small>
          </span>
        </a>
        <nav class="admin-nav" aria-label="Menu administrativo">
          ${navHtml}
        </nav>
        <div class="admin-user">
          <span>${session?.nome || "Admin"}</span>
          <small>${session?.email || ""}</small>
          <button type="button" id="btn-logout" class="ghost-button">Sair</button>
        </div>
      </aside>

      <main class="admin-main">
        <header class="page-header">
          <div>
            <span class="admin-kicker">Imperatriz Imóveis</span>
            <h1>${title}</h1>
            ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ""}
          </div>
          ${actions ? `<div class="page-actions">${actions}</div>` : ""}
        </header>

        <section class="page-content">
          ${content}
        </section>
      </main>
    </div>
  `;
}

export function bindAdminLayout() {
  document.getElementById("btn-logout")?.addEventListener("click", async () => {
    try {
      await logoutAdministrador();
    } catch (error) {
      console.error("Erro logout:", error?.message || error);
    } finally {
      window.location.replace("./login.html");
    }
  });
}

export function bindAdminLayoutEvents() {
  bindAdminLayout();
}
