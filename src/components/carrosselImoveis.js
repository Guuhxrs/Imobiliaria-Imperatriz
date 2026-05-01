import {
  escapeHtml,
  formatCurrencyBRL,
  getAmenidadesImovel,
  getLinhaSecundariaImovel,
} from "../utils/helpers.js";

function renderAmenidades(imovel) {
  const amenidades = getAmenidadesImovel(imovel).slice(0, 3);
  if (!amenidades.length) return "";

  return `
    <ul class="card-amenities compact">
      ${amenidades.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function renderCard(imovel) {
  const imageHtml = imovel.imagem_capa
    ? `<img src="${escapeHtml(imovel.imagem_capa)}" alt="${escapeHtml(imovel.titulo)}" draggable="false" loading="lazy" />`
    : '<div class="card-img-placeholder">Foto em breve</div>';
  const linhas = getLinhaSecundariaImovel(imovel);

  return `
    <article class="card-destaque anuncio-card">
      <a href="#detalhes/${encodeURIComponent(imovel.id)}" class="card-image-wrap">
        ${imageHtml}
      </a>
      <div class="card-desc anuncio-card-body">
        <span class="anuncio-kicker">Imperatriz Imóveis</span>
        <h3 class="anuncio-titulo">${escapeHtml(imovel.titulo)}</h3>
        ${linhas[0] ? `<p class="anuncio-linha principal">${escapeHtml(linhas[0])}</p>` : ""}
        ${linhas[1] ? `<p class="anuncio-linha">${escapeHtml(linhas[1])}</p>` : ""}
        <p class="card-price anuncio-preco">${formatCurrencyBRL(imovel.preco)}</p>
        ${renderAmenidades(imovel)}
        <a href="#detalhes/${encodeURIComponent(imovel.id)}" class="btn-primary btn-ver-mais">Ver mais</a>
      </div>
    </article>
  `;
}

export function renderCarrosselImoveis(imoveis, tituloCarrossel = "Imóveis em destaque", trackId = "cImgTrack") {
  if (!imoveis || imoveis.length === 0) return "";

  return `
    <section class="carrossel-imoveis-section animate-on-scroll">
      <div class="section-heading">
        <span class="section-kicker">Destaques Imperatriz</span>
        <h2>${tituloCarrossel}</h2>
      </div>
      <div class="carrossel-imoveis-wrapper">
        <button class="nav-control prev" id="btnPrev-${trackId}" aria-label="Voltar imóveis">‹</button>
        <div class="carrossel-imoveis-track" id="${trackId}">
          ${imoveis.map(renderCard).join("")}
        </div>
        <button class="nav-control next" id="btnNext-${trackId}" aria-label="Avançar imóveis">›</button>
      </div>
    </section>
  `;
}

export function initCarrosselImoveis(trackId = "cImgTrack") {
  const track = document.getElementById(trackId);
  if (!track) return;

  const btnPrev = document.getElementById(`btnPrev-${trackId}`);
  const btnNext = document.getElementById(`btnNext-${trackId}`);
  const scrollAmount = 340;

  btnPrev?.addEventListener("click", () => {
    track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });

  btnNext?.addEventListener("click", () => {
    track.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  track.addEventListener("mousedown", (event) => {
    isDown = true;
    track.classList.add("active-drag");
    startX = event.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });

  track.addEventListener("mouseleave", () => {
    isDown = false;
    track.classList.remove("active-drag");
  });

  track.addEventListener("mouseup", () => {
    isDown = false;
    track.classList.remove("active-drag");
  });

  track.addEventListener("mousemove", (event) => {
    if (!isDown) return;
    event.preventDefault();
    const x = event.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x - startX) * 1.7;
  });
}
