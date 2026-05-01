const slides = [
  {
    title: "Últimas unidades do Vila das Flores.",
    subtitle: "Não deixe para depois!",
    features: "100% financiado | 2 dormitórios e varanda | Localização privilegiada na Zona Sul | Condomínio fechado",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  },
  {
    title: "Lançamento exclusivo The Prime.",
    subtitle: "Oportunidade única",
    features: "Coberturas duplex | Vista panorâmica | Living integrado | Segurança 24h",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  },
  {
    title: "Moradas do Bosque.",
    subtitle: "Pronto para morar",
    features: "3 suítes | 4 vagas | Área de lazer completa | Financiamento direto e facilitado",
    image: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  },
  {
    title: "Urban Center Corporativo.",
    subtitle: "Sua empresa no melhor ponto",
    features: "Lajes vão livre | Salas inteligentes | Heliponto | Certificação sustentável",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  },
];

export function renderCarousel() {
  return `
    <section class="carousel-container" aria-label="Destaques Imperatriz">
      <div class="carousel-track" id="carouselTrack">
        ${slides.map((slide, index) => `
          <article
            class="carousel-slide ${index === 0 ? "active" : ""}"
            style="background-image: linear-gradient(90deg, rgba(9,18,26,0.88) 0%, rgba(9,18,26,0.58) 48%, rgba(9,18,26,0.16) 100%), url('${slide.image}')"
          >
            <div class="carousel-content">
              <span class="hero-pill">Curadoria em São José dos Campos</span>
              <h1>${slide.title} <strong>${slide.subtitle}</strong></h1>
              <p class="carousel-features">${slide.features}</p>
              <div class="hero-actions">
                <a href="#imoveis?tipo=venda" class="btn-primary btn-banner">Ver imóveis</a>
                <a href="#contato" class="btn-outline btn-banner">Falar com especialista</a>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
      <button class="carousel-btn prev" id="carouselPrev" aria-label="Slide anterior">‹</button>
      <button class="carousel-btn next" id="carouselNext" aria-label="Próximo slide">›</button>
      <div class="carousel-dots" id="carouselDots">
        ${slides.map((_, index) => `<button class="dot ${index === 0 ? "active" : ""}" data-index="${index}" aria-label="Ir para destaque ${index + 1}"></button>`).join("")}
      </div>
    </section>
  `;
}

export function initCarousel() {
  let index = 0;
  const track = document.getElementById("carouselTrack");
  if (!track) return;

  const slideEls = track.querySelectorAll(".carousel-slide");
  const dots = document.querySelectorAll(".carousel-dots .dot");
  const max = slideEls.length;
  let timer = null;

  const update = (nextIndex) => {
    slideEls.forEach((el) => el.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));
    slideEls[nextIndex]?.classList.add("active");
    dots[nextIndex]?.classList.add("active");
    index = nextIndex;
  };

  const next = () => update((index + 1) % max);
  const prev = () => update((index - 1 + max) % max);
  const resetInterval = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(next, 6000);
  };

  document.getElementById("carouselNext")?.addEventListener("click", () => {
    next();
    resetInterval();
  });

  document.getElementById("carouselPrev")?.addEventListener("click", () => {
    prev();
    resetInterval();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      update(Number(dot.dataset.index || 0));
      resetInterval();
    });
  });

  update(0);
  resetInterval();
}
