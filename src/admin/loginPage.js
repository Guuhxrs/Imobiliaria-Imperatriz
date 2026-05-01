import {
  autenticarAdministrador,
  getAdministradorAutenticado,
  getQuantidadeAdministradores,
} from "../api/administradores.js";
import { getRedirectAfterLogin } from "./access.js";
import { setFeedback } from "./layout.js";

function renderLoginPage() {
  return `
    <section class="login-panel">
      <div class="login-copy">
        <span class="admin-kicker">Painel Imperatriz</span>
        <h1>Entre para cuidar do catálogo.</h1>
        <p>Gerencie imóveis, fotos e mensagens dos clientes.</p>
        <a href="../index.html">Voltar ao site público</a>
      </div>

      <div class="login-card">
        <form id="admin-login-form" class="admin-form">
          <label>
            E-mail
            <input type="email" name="email" placeholder="admin@imperatriz.com" autocomplete="email" required />
          </label>

          <label>
            Senha
            <input type="password" name="senha" placeholder="Digite sua senha" autocomplete="current-password" required />
          </label>

          <button type="submit" class="primary-button">Entrar</button>
          <p id="admin-login-feedback" class="feedback"></p>
        </form>

        <div id="admin-bootstrap-alert" class="login-hint" hidden></div>
      </div>
    </section>
  `;
}

async function showBootstrapHint() {
  const hint = document.getElementById("admin-bootstrap-alert");
  if (!hint) return;

  try {
    const total = await getQuantidadeAdministradores();
    if (total > 0) return;

    hint.hidden = false;
    hint.innerHTML = `
      <strong>Nenhum administrador encontrado.</strong>
      <p>Rode o script <code>supabase/admin-bootstrap.sql</code> no SQL Editor do Supabase para liberar o primeiro acesso.</p>
    `;
  } catch (error) {
    console.error("Erro ao verificar bootstrap:", error?.message || error);
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const feedback = document.getElementById("admin-login-feedback");
  const submit = form.querySelector("button[type='submit']");
  setFeedback(feedback, "Validando credenciais...", "info");
  if (submit) submit.disabled = true;

  try {
    const formData = new FormData(form);
    await autenticarAdministrador({
      email: formData.get("email"),
      senha: formData.get("senha"),
    });

    setFeedback(feedback, "Login confirmado. Redirecionando...", "success");
    window.location.replace(getRedirectAfterLogin());
  } catch (error) {
    console.error("Erro login:", error?.message || error);
    setFeedback(feedback, error.message || "Não foi possível entrar.", "error");
    if (submit) submit.disabled = false;
  }
}

async function init() {
  const app = document.getElementById("admin-login-app");
  if (!app) {
    console.error("#admin-login-app not found");
    return;
  }

  try {
    const jaLogado = await getAdministradorAutenticado({ force: true });
    if (jaLogado) {
      window.location.replace(getRedirectAfterLogin());
      return;
    }
  } catch (error) {
    console.warn("Erro ao verificar sessão:", error?.message || error);
  }

  app.innerHTML = renderLoginPage();
  document.getElementById("admin-login-form")?.addEventListener("submit", handleSubmit);
  showBootstrapHint();
}

document.addEventListener("DOMContentLoaded", init);
