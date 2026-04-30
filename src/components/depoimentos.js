const depoimentos = [
  {
    nome: "Maria Silva",
    texto: "Excelente atendimento! A equipe foi muito atenciosa e me ajudou a encontrar o imóvel perfeito para minha família.",
    nota: 5
  },
  {
    nome: "Carlos Oliveira",
    texto: "Profissionais muito competentes. Comprei minha casa com segurança e rapidez. Recomendo!",
    nota: 5
  },
  {
    nome: "Ana Paula Santos",
    texto: "Fui atendida com muito respeito e dedicação. Minha experiência foi incrível do início ao fim.",
    nota: 5
  }
];

export function renderDepoimentos() {
  return `
    <section class="depoimentos-section">
      <h2>O que dizem nossos clientes</h2>
      <div class="depoimentos-grid">
        ${depoimentos.map(d => `
          <div class="depoimento-card">
            <div class="depoimento-stars">
              ${Array(d.nota).fill('<span>★</span>').join('')}
            </div>
            <p class="depoimento-texto">"${d.texto}"</p>
            <p class="depoimento-autor">— ${d.nome}</p>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}