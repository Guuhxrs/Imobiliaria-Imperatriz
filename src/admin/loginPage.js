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
        <p class="admin-kicker">Imperatriz Imoveis</p>
        <h1>Login administrativo</h1>
        <p>
          Esta area controla os imoveis exibidos no site publico e deve ser acessada
          apenas por administradores autorizados.
        </p>
        <a href="../index.html">Voltar ao site publico</a>
      </div>

      <div class="login-card">
        <form id="admin-login-form" class="admin-form">
          <label>
            E-mail
            <input type="email" name="email" placeholder="admin@imperatriz.com" required />
          </label>

          <label>
            Senha
            <input type="password" name="senha" placeholder="Digite sua senha" required />
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
      <p>
        Rode o script <code>supabase/admin-bootstrap.sql</code> no SQL Editor do Supabase
        para liberar o primeiro acesso administrativo.
      </p>
    `;
  } catch (error) {
    console.error(error);
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const feedback = document.getElementById("admin-login-feedback");
  setFeedback(feedback, "Validando credenciais...", "info");

  try {
    const formData = new FormData(form);
    await autenticarAdministrador({
      email: formData.get("email"),
      senha: formData.get("senha"),
    });

    setFeedback(feedback, "Login confirmado. Redirecionando...", "success");
    window.location.replace(getRedirectAfterLogin());
  } catch (error) {
    console.error(error);
    setFeedback(feedback, error.message || "Nao foi possivel entrar.", "error");
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
  } catch (e) {
    console.warn("Erro ao verificar sessão:", e);
  }

  app.innerHTML = renderLoginPage();
  document.getElementById("admin-login-form")?.addEventListener("submit", handleSubmit);
  showBootstrapHint();
}

document.addEventListener("DOMContentLoaded", init);
