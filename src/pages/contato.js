import { criarContato } from "../api/contatos.js";
import { renderNavbar } from "../components/navbar.js";

export function renderContatoPage() {
  return `
    ${renderNavbar("contato")}
    <main class="container contato-page">
      <section class="contact-hero">
        <span class="section-kicker">Contato</span>
        <h1>Vamos encontrar o endereço da sua próxima fase.</h1>
        <p>Escreva sua mensagem. Respondemos rapidinho pelo WhatsApp!</p>
        <div class="contact-cards">
          <a href="https://wa.me/5512996089901" target="_blank" rel="noreferrer">
            <strong>WhatsApp</strong>
            <span>(12) 99608-9901</span>
          </a>
          <a href="https://www.instagram.com/Imperatrizimoveis_sjc" target="_blank" rel="noreferrer">
            <strong>Instagram</strong>
            <span>@Imperatrizimoveis_sjc</span>
          </a>
        </div>
      </section>

      <form id="contato-form" class="form contact-form">
        <label>
          Nome
          <input name="nome" placeholder="Seu nome" minlength="2" required />
        </label>
        <label>
          E-mail
          <input name="email" type="email" placeholder="voce@email.com" required />
        </label>
        <label>
          Mensagem
          <textarea name="mensagem" placeholder="Conte o que você procura" rows="5" minlength="5" required></textarea>
        </label>
        <button type="submit" class="btn-primary">Enviar contato</button>
        <p id="contato-status" class="form-status" aria-live="polite"></p>
      </form>
    </main>
  `;
}

export function bindContatoPageEvents() {
  const form = document.getElementById("contato-form");
  const status = document.getElementById("contato-status");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Enviando...";
    status.className = "form-status info";

    try {
      const formData = new FormData(form);
      await criarContato({
        nome: formData.get("nome"),
        email: formData.get("email"),
        mensagem: formData.get("mensagem"),
      });

      form.reset();
      status.textContent = "Contato enviado com sucesso. A equipe já recebeu sua mensagem.";
      status.className = "form-status success";
    } catch (error) {
      console.error("Erro ao enviar contato:", error?.message || error);
      status.textContent = error?.message || "Não foi possível enviar. Tente novamente.";
      status.className = "form-status error";
    }
  });
}
