export function formatCurrencyBRL(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );
}

function normalizeLine(text = "") {
  return String(text || "")
    .replace(/^[*•\-]+\s*/g, "")
    .trim();
}

function normalizeSearchText(text = "") {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function parseDescricaoAnuncio(descricao = "") {
  const lines = String(descricao || "")
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);

  if (!lines.length) {
    return {
      observacaoValor: "",
      amenidades: [],
      textoLivre: "",
    };
  }

  if (lines.length === 1 && /[,:;]/.test(lines[0]) && lines[0].length > 40) {
    return {
      observacaoValor: "",
      amenidades: [],
      textoLivre: lines[0],
    };
  }

  let observacaoValor = "";
  let amenidades = [...lines];

  if (
    lines.length > 1 &&
    !/^\d+\s*(dormitorios?|quartos?|banheiros?|vagas?|m2)/i.test(normalizeSearchText(lines[0])) &&
    lines[0].length <= 60
  ) {
    [observacaoValor, ...amenidades] = lines;
  }

  return {
    observacaoValor,
    amenidades,
    textoLivre: amenidades.join(" "),
  };
}

export function getAmenidadesImovel(imovel) {
  const parsed = parseDescricaoAnuncio(imovel?.descricao || "");
  const amenidades = [...parsed.amenidades];

  const appendIfMissing = (label, pattern) => {
    if (!label) return;
    const exists = amenidades.some((item) => pattern.test(normalizeSearchText(item)));
    if (!exists) amenidades.unshift(label);
  };

  appendIfMissing(
    imovel?.quartos ? `${imovel.quartos} dormitório${Number(imovel.quartos) > 1 ? "s" : ""}` : "",
    /(dormitorios?|quartos?)/
  );
  appendIfMissing(
    imovel?.banheiros ? `${imovel.banheiros} banheiro${Number(imovel.banheiros) > 1 ? "s" : ""}` : "",
    /banheiros?/
  );
  appendIfMissing(
    imovel?.vagas ? `${imovel.vagas} vaga${Number(imovel.vagas) > 1 ? "s" : ""}` : "",
    /vagas?/
  );
  appendIfMissing(
    imovel?.area ? `${imovel.area} m²` : "",
    /(m2)/
  );

  return amenidades;
}

export function getLinhaSecundariaImovel(imovel) {
  return [imovel?.bairro, imovel?.cidade].filter(Boolean);
}

export function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function parseHashRoute(hash) {
  const raw = (hash || "#home").replace(/^#/, "");
  const [path, query] = raw.split("?");
  const [page, id] = path.split("/");
  return { page: page || "home", id: id || null, query: new URLSearchParams(query || "") };
}

export function formatDateBR(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
