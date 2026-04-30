import { getContatos, atualizarContatoStatus, limparContatosAntigos } from "../api/contatos.js";
import { renderAdminLayout, bindAdminLayout, setFeedback } from "./layout.js";
import { escapeHtml, formatDateBR } from "../utils/helpers.js";
import { requireAdminAccess } from "./access.js";

let session = null;
let contatosCache = [];

function buildGmailLink(contato) {
  const email = encodeURIComponent(contato.email || "");
  const subject = encodeURIComponent("Re: Recebemos sua mensagem - Imperatriz Imóveis");
  const body = encodeURIComponent(
    `Olá ${contato.nome || "Cliente"},\n\n` +
    `Recebemos sua mensagem:\n` +
    `"${contato.mensagem || ""}"\n\n` +
    `Em breve entraremos em contato com mais informações.\n\n` +
    `\n--\n` +
    `Equipe Imperatriz Imóveis\n` +
    `Telefone: (12) 99608-9901\n` +
    `Instagram: @Imperatrizimoveis_sjc`
  );
  return `https://mail.google.com/mail/?to=${email}&subject=${subject}&body=${body}`;
}

function renderMensagemItem(contato) {
  const lidaClass = contato.respondido ? "is-read" : "is-unread";
  const lidaLabel = contato.respondido ? "Respondido" : "Pendente";

  const contatoJson = JSON.stringify(contato).replace(/'/g, "&apos;");

  return `
    <article class="mensagem-card ${lidaClass}" data-contato-id="${contato.id}">
      <div class="mensagem-header">
        <div>
          <strong>${escapeHtml(contato.nome)}</strong>
          <span class="mensagem-email">${escapeHtml(contato.email)}</span>
        </div>
        <span class="mensagem-badge ${lidaClass}">${lidaLabel}</span>
      </div>
      <p class="mensagem-preview">${escapeHtml(contato.mensagem?.substring(0, 100) || "")}...</p>
      <div class="mensagem-footer">
        <span class="mensagem-data">${formatDateBR(contato.created_at)}</span>
        <div class="mensagens-actions">
          <button type="button" class="ghost-button btn-ver-detalhes" data-id="${contato.id}">Ver detalhes</button>
          ${!contato.respondido ? `<button type="button" class="primary-button btn-marcar" data-id="${contato.id}">Marcar como Respondido</button>` : ""}
          <button type="button" class="ghost-button btn-responder" data-contato='${contatoJson}'>Responder por email</button>
        </div>
      </div>
    </article>
  `;
}

function renderModalDetalhes(contato) {
  const contatoJson = JSON.stringify(contato).replace(/'/g, "&apos;");
  return `
    <div class="modal-overlay" id="modal-detalhes-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Mensagem de ${escapeHtml(contato.nome)}</h3>
          <button type="button" class="ghost-button btn-fechar-modal">X</button>
        </div>
        <div class="modal-body">
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(contato.email)}">${escapeHtml(contato.email)}</a></p>
          <p><strong>Data:</strong> ${formatDateBR(contato.created_at)}</p>
          <p><strong>Status:</strong> ${contato.respondido ? "Respondido" : "Pendente"}</p>
          <hr />
          <div class="mensagem-completa">
            <strong>Mensagem:</strong>
            <p>${escapeHtml(contato.mensagem)}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="primary-button btn-responder" data-contato='${contatoJson}'>Responder por email</button>
          ${!contato.respondido ? `<button type="button" class="primary-button btn-marcar-modal" data-id="${contato.id}">Marcar como Respondido</button>` : ""}
          <button type="button" class="ghost-button btn-fechar-modal">Fechar</button>
        </div>
      </div>
    </div>
  `;
}

function renderPage(contatos) {
  const total = contatos.length;
  const pendentes = contatos.filter(c => !c.respondido).length;

  return renderAdminLayout({
    active: "mensagens",
    title: "Mensagens",
    subtitle: `${total} mensagem(ns), ${pendentes} pendente(s)`,
    session,
    actions: '<button type="button" class="danger-button" id="btn-limpar">Limpar mensagens antigas (30+ dias)</button>',
    content: `
      <section class="mensagens-list">
        ${contatos.length === 0 ? `
          <div class="empty-card">
            <p>Nenhuma mensagem recebida ainda.</p>
          </div>
        ` : contatos.map(renderMensagemItem).join("")}
      </section>
      <div id="modal-detalhes"></div>
      <p id="limpar-feedback"></p>
    `,
  });
}

function handleVerDetalhes(id) {
  const contato = contatosCache.find(c => c.id === id);
  if (!contato) return;
  const modal = document.getElementById("modal-detalhes");
  if (modal) modal.innerHTML = renderModalDetalhes(contato);
}

function handleMarcarRespondido(id, reload = true) {
  atualizarContatoStatus(id, true).then(() => {
    if (reload) window.location.reload();
  });
}

function handleResponderEmail(contatoStr) {
  try {
    const contato = JSON.parse(contatoStr.replace(/&apos;/g, "'"));
    const url = buildGmailLink(contato);
    window.open(url, "_blank");
  } catch (e) {
    console.error("Erro ao abrir email:", e);
  }
}

function handleFecharModal() {
  const modal = document.getElementById("modal-detalhes");
  if (modal) modal.innerHTML = "";
}

document.addEventListener("click", (e) => {
  const target = e.target;
  
  if (target.classList.contains("btn-ver-detalhes")) {
    handleVerDetalhes(target.dataset.id);
    return;
  }
  
  if (target.classList.contains("btn-marcar")) {
    handleMarcarRespondido(target.dataset.id);
    return;
  }
  
  if (target.classList.contains("btn-marcar-modal")) {
    handleMarcarRespondido(target.dataset.id);
    return;
  }
  
  if (target.classList.contains("btn-responder")) {
    handleResponderEmail(target.dataset.contato);
    return;
  }
  
  if (target.classList.contains("btn-fechar-modal")) {
    handleFecharModal();
    return;
  }

  if (target.closest(".btn-fechar-modal")) {
    handleFecharModal();
    return;
  }
});

function bindPageEvents() {
  document.getElementById("btn-limpar")?.addEventListener("click", async () => {
    const feedback = document.getElementById("limpar-feedback");
    if (!confirm("Tem certeza que deseja limpar mensagens respondidas há mais de 30 dias?")) return;
    
    feedback.textContent = "Limpando...";
    try {
      const removidos = await limparContatosAntigos();
      feedback.textContent = `${removidos} mensagem(ns) removida(s)`;
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      feedback.textContent = "Erro ao limpar: " + error.message;
    }
  });
}

async function init() {
  session = await requireAdminAccess();
  if (!session) return;

  const app = document.getElementById("admin-app");
  if (!app) return;

  try {
    contatosCache = await getContatos();
    app.innerHTML = renderPage(contatosCache);
    bindAdminLayout();
    bindPageEvents();
  } catch (error) {
    console.error(error);
    app.innerHTML = "<p>Erro ao carregar mensagens.</p>";
  }
}

document.addEventListener("DOMContentLoaded", init);