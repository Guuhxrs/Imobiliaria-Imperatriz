export function renderNavbar(active = "home") {
  const isActive = (route) => (active === route ? "active" : "");

  return `
    <nav class="navbar" aria-label="Navegação principal">
      <div class="brand">
        <a href="#home" data-route="home" class="brand-link">
          <img src="./src/assets/logo.jpg" alt="Logo Imperatriz Imóveis" class="logo-img" />
          <span>
            <strong>Imperatriz</strong>
            <small>Imóveis</small>
          </span>
        </a>
      </div>
      <div class="links">
        <a href="#home" data-route="home" class="${isActive("home")}">Home</a>
        <a href="#imoveis?tipo=venda" data-route="imoveis" class="${isActive("imoveis")}">Comprar</a>
        <a href="#imoveis?tipo=aluguel" data-route="imoveis-aluguel" class="${isActive("imoveis")}">Alugar</a>
        <a href="#sobre" data-route="sobre" class="${isActive("sobre")}">Sobre nós</a>
        <a href="#contato" data-route="contato" class="${isActive("contato")}">Contato</a>
      </div>
    </nav>
  `;
}
