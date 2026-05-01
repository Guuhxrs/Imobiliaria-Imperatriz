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
    `Equipe Imperatriz Imóveis\n` +
    `Telefone: (12) 99608-9901\n` +
    `Instagram: @Imperatrizimoveis_sjc`
  );
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
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
      <p class="mensagem-preview">${escapeHtml(contato.mensagem?.substring(0, 130) || "")}${contato.mensagem?.length > 130 ? "..." : ""}</p>
      <div class="mensagem-footer">
        <span class="mensagem-data">${formatDateBR(contato.created_at)}</span>
        <div class="mensagens-actions">
          <button type="button" class="ghost-button btn-ver-detalhes" data-id="${contato.id}">Ver detalhes</button>
          ${!contato.respondido ? `<button type="button" class="primary-button btn-marcar" data-id="${contato.id}">Marcar respondido</button>` : ""}
          <button type="button" class="ghost-button btn-responder" data-contato='${contatoJson}'>Responder</button>
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
          <button type="button" class="ghost-button btn-fechar-modal">Fechar</button>
        </div>
        <div class="modal-body">
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(contato.email)}">${escapeHtml(contato.email)}</a></p>
          <p><strong>Data:</strong> ${formatDateBR(contato.created_at)}</p>
          <p><strong>Status:</strong> ${contato.respondido ? "Respondido" : "Pendente"}</p>
          <div class="mensagem-completa">
            <strong>Mensagem:</strong>
            <p>${escapeHtml(contato.mensagem)}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="primary-button btn-responder" data-contato='${contatoJson}'>Responder por email</button>
          ${!contato.respondido ? `<button type="button" class="primary-button btn-marcar-modal" data-id="${contato.id}">Marcar respondido</button>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderPage(contatos) {
  const total = contatos.length;
  const pendentes = contatos.filter((contato) => !contato.respondido).length;

  return renderAdminLayout({
    active: "mensagens",
    title: "Mensagens",
    subtitle: `${total} mensagem(ns), ${pendentes} pendente(s).`,
    session,
    actions: '<button type="button" class="danger-button" id="btn-limpar">Limpar antigas</button>',
    content: `
      <section class="mensagens-list">
        ${contatos.length === 0 ? `
          <div class="empty-card">
            <p>Nenhuma mensagem recebida ainda.</p>
          </div>
        ` : contatos.map(renderMensagemItem).join("")}
      </section>
      <div id="modal-detalhes"></div>
      <p id="limpar-feedback" class="feedback"></p>
    `,
  });
}

function handleVerDetalhes(id) {
  const contato = contatosCache.find((item) => item.id === id);
  if (!contato) return;
  const modal = document.getElementById("modal-detalhes");
  if (modal) modal.innerHTML = renderModalDetalhes(contato);
}

async function handleMarcarRespondido(id) {
  await atualizarContatoStatus(id, true);
  contatosCache = await getContatos();
  const app = document.getElementById("admin-app");
  if (app) {
    app.innerHTML = renderPage(contatosCache);
    bindAdminLayout();
    bindPageEvents();
  }
}

function handleResponderEmail(contatoStr) {
  try {
    const contato = JSON.parse(contatoStr.replace(/&apos;/g, "'"));
    window.open(buildGmailLink(contato), "_blank");
  } catch (error) {
    console.error("Erro ao abrir email:", error);
  }
}

function handleFecharModal() {
  const modal = document.getElementById("modal-detalhes");
  if (modal) modal.innerHTML = "";
}

document.addEventListener("click", async (event) => {
  const target = event.target;

  if (target.classList.contains("btn-ver-detalhes")) return handleVerDetalhes(target.dataset.id);
  if (target.classList.contains("btn-marcar") || target.classList.contains("btn-marcar-modal")) return handleMarcarRespondido(target.dataset.id);
  if (target.classList.contains("btn-responder")) return handleResponderEmail(target.dataset.contato);
  if (target.classList.contains("btn-fechar-modal") || target.closest(".modal-overlay") === target) return handleFecharModal();
});

function bindPageEvents() {
  document.getElementById("btn-limpar")?.addEventListener("click", async () => {
    const feedback = document.getElementById("limpar-feedback");
    if (!confirm("Limpar mensagens respondidas há mais de 30 dias?")) return;

    setFeedback(feedback, "Limpando...", "info");
    try {
      const removidos = await limparContatosAntigos();
      setFeedback(feedback, `${removidos} mensagem(ns) removida(s).`, "success");
      contatosCache = await getContatos();
    } catch (error) {
      setFeedback(feedback, `Erro ao limpar: ${error.message}`, "error");
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
    app.innerHTML = '<main class="admin-main"><p>Erro ao carregar mensagens.</p></main>';
  }
}

document.addEventListener("DOMContentLoaded", init);
