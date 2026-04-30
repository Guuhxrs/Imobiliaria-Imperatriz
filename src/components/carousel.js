const slides = [
  {
    title: "Últimas unidades do Vila das Flores.",
    subtitle: "Não deixe para depois!",
    features: "100% financiado | 2 dormitórios e varanda | Localização privilegiada na Zona Sul | Condomínio fechado",
    phone: "(12) 99608-9901",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  },
  {
    title: "Lançamento Exclusivo The Prime.",
    subtitle: "Oportunidade Única",
    features: "Coberturas Duplex | Vista Panorâmica | Living Integrado | Segurança 24h",
    phone: "(12) 99608-9901",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  },
  {
    title: "Moradas do Bosque.",
    subtitle: "Pronto para morar",
    features: "3 suítes | 4 vagas | Área de lazer completa | Financiamento direto e facilitado",
    phone: "(12) 99608-9901",
    image: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  },
  {
    title: "Urban Center Corporativo.",
    subtitle: "Sua empresa no melhor ponto",
    features: "Lajes Vão Livre | Salas Inteligentes | Heliponto | Certificação Sustentável",
    phone: "(12) 99608-9901",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  }
];

export function renderCarousel() {
  return `
    <div class="carousel-container">
      <div class="carousel-track" id="carouselTrack">
        ${slides.map((s, i) => `
          <div class="carousel-slide ${i === 0 ? 'active' : ''}" style="background-image: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 100%), url('${s.image}')">
            <div class="carousel-content">
              <h1>${s.title} <br/><strong>${s.subtitle}</strong></h1>
              <p class="carousel-features">${s.features}</p>
              <a href="#contato" class="btn-primary btn-banner">Entre em contato - ${s.phone}</a>
            </div>
          </div>
        `).join('')}
      </div>
      <button class="carousel-btn prev" id="carouselPrev">❮</button>
      <button class="carousel-btn next" id="carouselNext">❯</button>
      <div class="carousel-dots" id="carouselDots">
        ${slides.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
      </div>
    </div>
  `;
}

export function initCarousel() {
  let index = 0;
  const track = document.getElementById("carouselTrack");
  if (!track) return;
  const slidesEls = track.querySelectorAll(".carousel-slide");
  const dots = document.querySelectorAll(".carousel-dots .dot");
  const max = slidesEls.length;

  const update = (i) => {
    slidesEls.forEach(el => {
      el.classList.remove('active');
      el.style.opacity = '0';
      el.style.zIndex = '0';
    });
    dots.forEach(d => d.classList.remove('active'));
    
    slidesEls[i].classList.add('active');
    slidesEls[i].style.opacity = '1';
    slidesEls[i].style.zIndex = '1';
    dots[i].classList.add('active');
  };

  const next = () => {
    index = (index + 1) % max;
    update(index);
  };
  const prev = () => {
    index = (index - 1 + max) % max;
    update(index);
  };

  document.getElementById("carouselNext")?.addEventListener("click", () => {
    next();
    resetInterval();
  });
  
  document.getElementById("carouselPrev")?.addEventListener("click", () => {
    prev();
    resetInterval();
  });

  dots.forEach(dot => {
    dot.addEventListener("click", (e) => {
      index = parseInt(e.target.dataset.index, 10);
      update(index);
      resetInterval();
    });
  });

  let timer = setInterval(next, 5000);
  const resetInterval = () => {
    clearInterval(timer);
    timer = setInterval(next, 5000);
  };

  // Setup Inicial
  update(0);
}
