import {
  atualizarImovel,
  criarImovel,
  getImovelById,
  getImoveis,
  removerImovel,
} from "../api/imoveis.js";
import { renderNavbar } from "../components/navbar.js";
import { formatCurrencyBRL } from "../utils/helpers.js";
import { getAdministradorAutenticado, logoutAdministrador } from "../api/administradores.js";

function toPayload(formData) {
  return {
    titulo: String(formData.get("titulo") || "").trim(),
    descricao: String(formData.get("descricao") || "").trim(),
    preco: Number(formData.get("preco") || 0),
    cidade: String(formData.get("cidade") || "").trim(),
    bairro: String(formData.get("bairro") || "").trim(),
    quartos: Number(formData.get("quartos") || 0),
    banheiros: Number(formData.get("banheiros") || 0),
    vagas: Number(formData.get("vagas") || 0),
    area: Number(formData.get("area") || 0),
    imagem_capa: String(formData.get("imagem_capa") || "").trim(),
  };
}

function renderAdminList(imoveis) {
  return imoveis
    .map(
      (item) => `
      <li class="admin-item" data-id="${item.id}">
        <div>
          <strong>${item.titulo}</strong>
          <p>${item.bairro || ""}${item.cidade ? `, ${item.cidade}` : ""} · ${formatCurrencyBRL(item.preco)}</p>
        </div>
        <div class="admin-actions">
          <button type="button" data-action="edit">Editar</button>
          <button type="button" data-action="delete">Excluir</button>
        </div>
      </li>
    `
    )
    .join("");
}

function renderSelectOptions(imoveis) {
  return [
    '<option value="">Selecione um imóvel para editar</option>',
    ...imoveis.map(
      (item) => `<option value="${item.id}">${item.titulo} — ${formatCurrencyBRL(item.preco)}</option>`
    ),
  ].join("");
}

export async function renderAdminPage() {
  const imoveis = await getImoveis({ limit: 100 });

  return `
    ${renderNavbar("admin")}
    <main class="container">
      <section>
        <h1>Área do Administrador</h1>
        <p>Configure os imóveis cadastrados no banco de dados.</p>
        <button type="button" id="admin-logout">Sair da área administrativa</button>
      </section>

      <section class="admin-grid">
        <form id="admin-imovel-form" class="form">
          <label for="admin-imovel-select">Selecionar imóvel existente</label>
          <select id="admin-imovel-select" name="selected_imovel">
            ${renderSelectOptions(imoveis)}
          </select>

          <input type="hidden" name="id" />
          <input name="titulo" placeholder="Título" required />
          <input name="preco" type="number" placeholder="Preço" required />
          <input name="cidade" placeholder="Cidade" />
          <input name="bairro" placeholder="Bairro" />
          <input name="quartos" type="number" placeholder="Quartos" />
          <input name="banheiros" type="number" placeholder="Banheiros" />
          <input name="vagas" type="number" placeholder="Vagas" />
          <input name="area" type="number" placeholder="Área (m²)" />
          <input name="imagem_capa" placeholder="URL da imagem" />
          <textarea name="descricao" rows="4" placeholder="Descrição"></textarea>
          <button type="submit">Salvar imóvel</button>
          <button type="button" id="admin-limpar">Limpar</button>
          <p id="admin-status"></p>
        </form>

        <div>
          <h2>Imóveis cadastrados</h2>
          <ul id="admin-imoveis-list" class="admin-list">
            ${renderAdminList(imoveis)}
          </ul>
        </div>
      </section>
    </main>
  `;
}

export async function bindAdminPageEvents() {
  const form = document.getElementById("admin-imovel-form");
  const select = document.getElementById("admin-imovel-select");
  const list = document.getElementById("admin-imoveis-list");
  const status = document.getElementById("admin-status");
  const limparBtn = document.getElementById("admin-limpar");
  const logoutBtn = document.getElementById("admin-logout");

  if (!form || !select || !list || !status || !limparBtn || !logoutBtn) return;

  const fillForm = (item) => {
    form.id.value = item.id || "";
    form.titulo.value = item.titulo || "";
    form.preco.value = item.preco || 0;
    form.cidade.value = item.cidade || "";
    form.bairro.value = item.bairro || "";
    form.quartos.value = item.quartos || 0;
    form.banheiros.value = item.banheiros || 0;
    form.vagas.value = item.vagas || 0;
    form.area.value = item.area || 0;
    form.imagem_capa.value = item.imagem_capa || "";
    form.descricao.value = item.descricao || "";
  };


  const adminLogado = getAdministradorAutenticado();
  if (!adminLogado) {
    window.location.hash = "#admin-login";
    return;
  }

  logoutBtn.addEventListener("click", () => {
    logoutAdministrador();
    window.location.hash = "#admin-login";
  });

  const clearForm = () => {
    form.reset();
    form.id.value = "";
    select.value = "";
  };

  async function refreshFromDatabase() {
    const atualizados = await getImoveis({ limit: 100 });
    list.innerHTML = renderAdminList(atualizados);
    select.innerHTML = renderSelectOptions(atualizados);
  }

  limparBtn.addEventListener("click", clearForm);

  select.addEventListener("change", async () => {
    const id = select.value;
    if (!id) {
      clearForm();
      status.textContent = "Formulário limpo.";
      return;
    }

    try {
      status.textContent = "Buscando imóvel no banco...";
      const item = await getImovelById(id);
      fillForm(item);
      status.textContent = "Imóvel carregado diretamente do banco.";
    } catch (error) {
      console.error(error);
      status.textContent = "Erro ao carregar imóvel selecionado.";
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Salvando no banco...";

    try {
      const formData = new FormData(form);
      const id = String(formData.get("id") || "").trim();
      const payload = toPayload(formData);

      if (id) {
        await atualizarImovel(id, payload);
        status.textContent = "Imóvel atualizado no banco com sucesso.";
      } else {
        await criarImovel(payload);
        status.textContent = "Imóvel criado no banco com sucesso.";
      }

      clearForm();
      await refreshFromDatabase();
    } catch (error) {
      console.error(error);
      status.textContent = "Erro ao salvar imóvel no banco.";
    }
  });

  list.addEventListener("click", async (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;

    const itemEl = btn.closest(".admin-item");
    const id = itemEl?.dataset.id;
    if (!id) return;

    try {
      if (btn.dataset.action === "delete") {
        status.textContent = "Removendo no banco...";
        await removerImovel(id);
        await refreshFromDatabase();
        status.textContent = "Imóvel removido do banco com sucesso.";
        clearForm();
      }

      if (btn.dataset.action === "edit") {
        status.textContent = "Buscando imóvel no banco...";
        const item = await getImovelById(id);
        fillForm(item);
        select.value = id;
        status.textContent = "Editando imóvel carregado do banco.";
      }
    } catch (error) {
      console.error(error);
      status.textContent = "Erro ao executar ação no banco de dados.";
    }
  });
}
