import { renderNavbar } from "../components/navbar.js";

export function renderSobrePage() {
  return `
    ${renderNavbar("sobre")}
    <main class="container sobre-page">
      <section class="sobre-hero">
        <div>
          <span class="section-kicker">Sobre nós</span>
          <h1>Imobiliária jovem, processo claro e atendimento próximo.</h1>
          <p>
            A Imperatriz Imóveis conecta pessoas a imóveis reais com curadoria, velocidade e
            uma comunicação simples do começo ao fim.
          </p>
          <div class="cta-buttons">
            <a href="#imoveis?tipo=venda" class="btn-primary">Ver imóveis</a>
            <a href="#contato" class="btn-outline">Falar com a equipe</a>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80" alt="Equipe analisando imóveis" />
      </section>

      <section class="sobre-grid">
        <article>
          <strong>Curadoria</strong>
          <p>Organizamos o catálogo para você comparar opções sem perder tempo.</p>
        </article>
        <article>
          <strong>Transparência</strong>
          <p>Todas as informações estão sempre atualizadas.</p>
        </article>
        <article>
          <strong>Agilidade</strong>
          <p>Contato direto por formulário, WhatsApp e redes sociais.</p>
        </article>
      </section>
    </main>
  `;
}
