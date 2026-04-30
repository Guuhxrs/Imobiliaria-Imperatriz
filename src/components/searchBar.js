export function renderSearchBar() {
  return `
    <section class="search-bar-section">
      <div class="search-bar">
        <h2>Encontre seu imóvel ideal</h2>
        <form class="search-form" id="searchForm">
          <div class="search-field">
            <label for="search-cidade">Cidade</label>
            <input type="text" id="search-cidade" placeholder="São José dos Campos" />
          </div>
          <div class="search-field">
            <label for="search-tipo">Tipo</label>
            <select id="search-tipo">
              <option value="">Todos os tipos</option>
              <option value="venda">Comprar</option>
              <option value="aluguel">Alugar</option>
            </select>
          </div>
          <div class="search-field">
            <label for="search-quartos">Quartos</label>
            <select id="search-quartos">
              <option value="">Qualquer número</option>
              <option value="1">1 quarto</option>
              <option value="2">2 quartos</option>
              <option value="3">3 quartos</option>
              <option value="4">4+ quartos</option>
            </select>
          </div>
          <div class="search-field">
            <label for="search-preco">Faixa de preço</label>
            <select id="search-preco">
              <option value="">Qualquer preço</option>
              <option value="0-300000">Até R$ 300 mil</option>
              <option value="300000-500000">R$ 300 mil - 500 mil</option>
              <option value="500000-800000">R$ 500 mil - 800 mil</option>
              <option value="800000-1000000">R$ 800 mil - 1 mi</option>
              <option value="1000000-">Acima de R$ 1 mi</option>
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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    const cidade = document.getElementById("search-cidade").value;
    const tipo = document.getElementById("search-tipo").value;
    const quartos = document.getElementById("search-quartos").value;
    const preco = document.getElementById("search-preco").value;

    if (cidade) params.append("cidade", cidade);
    if (tipo) params.append("tipo", tipo);
    if (quartos) params.append("quartos", quartos);
    if (preco) params.append("preco", preco);

    window.location.hash = "#imoveis" + (params.toString() ? "?" + params.toString() : "");
  });
}