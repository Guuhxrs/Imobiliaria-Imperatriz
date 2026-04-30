import { criarContato } from "../api/contatos.js";
import { renderNavbar } from "../components/navbar.js";

export function renderContatoPage() {
  return `
    ${renderNavbar("contato")}
    <main class="container">
      <section>
        <h1>Contato</h1>
        <p>Fale com a equipe da Imperatriz Imóveis.</p>
      </section>
      <form id="contato-form" class="form">
        <input name="nome" placeholder="Nome" required />
        <input name="email" type="email" placeholder="E-mail" required />
        <textarea name="mensagem" placeholder="Mensagem" rows="5" required></textarea>
        <button type="submit">Enviar contato</button>
      </form>
      <p id="contato-status"></p>
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

    try {
      const formData = new FormData(form);
      await criarContato({
        nome: formData.get("nome"),
        email: formData.get("email"),
        mensagem: formData.get("mensagem"),
      });

      form.reset();
      status.textContent = "Contato enviado com sucesso!";
    } catch (error) {
      console.error(error);
      status.textContent = error?.message || "Erro ao enviar contato. Tente novamente.";
    }
  });
}
