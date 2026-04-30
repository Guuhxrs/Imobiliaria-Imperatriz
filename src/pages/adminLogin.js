import { autenticarAdministrador } from "../api/administradores.js";

export function renderAdminLoginPage() {
  return `
    <main class="login-admin-main">
      <div class="login-admin-card">
        <div class="login-admin-brand">
          <img src="./src/assets/logo.jpg" alt="Imperatriz Imóveis" class="login-logo" />
          <span class="login-brand-text">Imperatriz Imóveis</span>
          <span class="login-brand-subtitle">Administração</span>
        </div>

        <form id="admin-login-form" class="login-admin-form">
          <div class="form-group">
            <label for="admin-email">E-mail</label>
            <input 
              id="admin-email" 
              name="email" 
              type="email" 
              placeholder="seu@email.com" 
              required 
              autocomplete="email"
            />
          </div>
          <div class="form-group">
            <label for="admin-senha">Senha</label>
            <input 
              id="admin-senha" 
              name="senha" 
              type="password" 
              placeholder="••••••••" 
              required 
              autocomplete="current-password"
            />
          </div>
          <button type="submit" class="btn-login">
            <span>Entrar</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
          <p id="admin-login-status" class="login-status"></p>
        </form>

        <div class="login-admin-footer">
          <a href="#home">← Voltar ao site</a>
        </div>
      </div>
    </main>
  `;
}

export function bindAdminLoginEvents() {
  const form = document.getElementById("admin-login-form");
  const status = document.getElementById("admin-login-status");
  const btn = form?.querySelector("button");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Validando credenciais...";
    status.className = "login-status";
    if (btn) btn.disabled = true;

    try {
      const formData = new FormData(form);
      await autenticarAdministrador({
        email: formData.get("email"),
        senha: formData.get("senha"),
      });

      status.textContent = "Login realizado com sucesso!";
      status.className = "login-status success";
      setTimeout(() => { window.location.hash = "#admin"; }, 500);
    } catch (error) {
      console.error(error);
      status.textContent = "Falha no login. Verifique e-mail e senha.";
      status.className = "login-status error";
      if (btn) btn.disabled = false;
    }
  });
}
