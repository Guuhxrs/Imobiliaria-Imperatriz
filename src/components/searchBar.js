export function renderSearchBar() {
  return `
    <section class="search-bar-section">
      <div class="search-bar">
        <div>
          <span class="section-kicker">Busca rápida</span>
          <h2>Encontre um imóvel com o seu ritmo</h2>
        </div>
        <form class="search-form" id="searchForm">
          <div class="search-field">
            <label for="search-cidade">Cidade ou bairro</label>
            <input type="text" id="search-cidade" placeholder="São José dos Campos" />
          </div>
          <div class="search-field">
            <label for="search-negocio">Objetivo</label>
            <select id="search-negocio">
              <option value="venda">Comprar</option>
              <option value="aluguel">Alugar</option>
            </select>
          </div>
          <div class="search-field">
            <label for="search-tipo-imovel">Tipo de imóvel</label>
            <select id="search-tipo-imovel">
              <option value="">Todos</option>
              <option value="residencial">Residencial</option>
              <option value="comercial">Comercial</option>
              <option value="terreno">Terreno</option>
            </select>
          </div>
          <button type="submit" class="btn-search">Buscar imóveis</button>
        </form>
      </div>
    </section>
  `;
}

export function initSearchBar() {
  const form = document.getElementById("searchForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const params = new URLSearchParams();

    const cidade = document.getElementById("search-cidade")?.value.trim();
    const negocio = document.getElementById("search-negocio")?.value;
    const tipoImovel = document.getElementById("search-tipo-imovel")?.value;

    if (cidade) params.set("search", cidade);
    if (negocio) params.set("tipo", negocio);
    if (tipoImovel) params.set("tipo_imovel", tipoImovel);

    window.location.hash = `#imoveis${params.toString() ? `?${params.toString()}` : ""}`;
  });
}
