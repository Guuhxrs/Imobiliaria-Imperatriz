const depoimentos = [
  {
    nome: "Maria Silva",
    texto: "Excelente atendimento. A equipe foi leve, direta e me ajudou a encontrar o imóvel perfeito para minha família.",
    nota: 5,
  },
  {
    nome: "Carlos Oliveira",
    texto: "Comprei minha casa com segurança e rapidez. O processo foi claro do primeiro contato até a assinatura.",
    nota: 5,
  },
  {
    nome: "Ana Paula Santos",
    texto: "Fui atendida com respeito e dedicação. Minha experiência foi incrível do início ao fim.",
    nota: 5,
  },
];

export function renderDepoimentos() {
  return `
    <section class="depoimentos-section">
      <div class="section-heading center">
        <span class="section-kicker">Quem comprou conta</span>
        <h2>Atendimento próximo, busca sem enrolação</h2>
      </div>
      <div class="depoimentos-grid">
        ${depoimentos.map((depoimento) => `
          <article class="depoimento-card">
            <div class="depoimento-stars" aria-label="${depoimento.nota} estrelas">
              ${Array(depoimento.nota).fill("<span>★</span>").join("")}
            </div>
            <p class="depoimento-texto">"${depoimento.texto}"</p>
            <p class="depoimento-autor">- ${depoimento.nome}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}
