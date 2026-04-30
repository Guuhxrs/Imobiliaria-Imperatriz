import {
  atualizarImovel,
  criarImovel,
  getImovelById,
  getImoveisAdmin,
  removerImovel,
  uploadImagemImovel,
} from "../api/imoveis.js";
import { renderAdminLayout, bindAdminLayout, setFeedback } from "./layout.js";
import { requireAdminAccess } from "./access.js";
import { escapeHtml, formatCurrencyBRL } from "../utils/helpers.js";

let session = null;
let imoveisCache = [];

function renderImovelItem(imovel) {
  return `
    <article class="imovel-item" data-id="${imovel.id}">
      <div class="imovel-info">
        <strong>${escapeHtml(imovel.titulo)}</strong>
        <p>${escapeHtml(imovel.bairro || "")}${imovel.cidade ? `, ${escapeHtml(imovel.cidade)}` : ""}</p>
        <span class="imovel-price">${formatCurrencyBRL(imovel.preco)}</span>
        <span class="imovel-status ${imovel.status}">${imovel.status}</span>
      </div>
      <div class="imovel-actions">
        <button type="button" class="primary-button btn-edit" data-id="${imovel.id}">Editar</button>
        <button type="button" class="danger-button btn-delete" data-id="${imovel.id}">Excluir</button>
      </div>
    </article>
  `;
}

function renderPage(imoveis) {
  return renderAdminLayout({
    active: "imoveis",
    title: "Imóveis",
    subtitle: `${imoveis.length} imóvel(is) cadastrado(s)`,
    session,
    actions: '<button type="button" class="primary-button" id="btn-novo">+ Novo Imóvel</button>',
    content: `
      <div class="imoveis-grid">
        <form id="imovel-form" class="imovel-form">
          <h3 id="form-title">Novo Imóvel</h3>
          <input type="hidden" name="id" />
          
          <div class="form-row">
            <div class="form-group">
              <label>Título</label>
              <input name="titulo" required />
            </div>
            <div class="form-group">
              <label>Preço</label>
              <input name="preco" type="number" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Cidade</label>
              <input name="cidade" />
            </div>
            <div class="form-group">
              <label>Bairro</label>
              <input name="bairro" />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Tipo</label>
              <select name="tipo">
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
                <option value="terreno">Terreno</option>
              </select>
            </div>
            <div class="form-group">
              <label>Negócio</label>
              <select name="tipo_negocio">
                <option value="venda">Venda</option>
                <option value="aluguel">Aluguel</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Quartos</label>
              <input name="quartos" type="number" />
            </div>
            <div class="form-group">
              <label>Banheiros</label>
              <input name="banheiros" type="number" />
            </div>
            <div class="form-group">
              <label>Vagas</label>
              <input name="vagas" type="number" />
            </div>
            <div class="form-group">
              <label>Área (m²)</label>
              <input name="area" type="number" />
            </div>
          </div>
          
          <div class="form-group">
            <label>URL da Imagem de Capa</label>
            <input name="imagem_capa" placeholder="https://..." />
          </div>
          
          <div class="form-group">
            <label>Descrição</label>
            <textarea name="descricao" rows="4"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="primary-button">Salvar</button>
            <button type="button" class="ghost-button" id="btn-cancelar">Cancelar</button>
          </div>
          <p id="form-feedback"></p>
        </form>
        
        <div class="imoveis-list">
          <h3>Imóveis Cadastrados</h3>
          <div id="imoveis-container">
            ${imoveis.length === 0 ? "<p>Nenhum imóvel cadastrado.</p>" : imoveis.map(renderImovelItem).join("")}
          </div>
        </div>
      </div>
    `,
  });
}

function fillForm(imovel) {
  const form = document.getElementById("imovel-form");
  form.id.value = imovel.id || "";
  form.titulo.value = imovel.titulo || "";
  form.preco.value = imovel.preco || "";
  form.cidade.value = imovel.cidade || "";
  form.bairro.value = imovel.bairro || "";
  form.tipo.value = imovel.tipo || "residencial";
  form.tipo_negocio.value = imovel.tipo_negocio || "venda";
  form.quartos.value = imovel.quartos || "";
  form.banheiros.value = imovel.banheiros || "";
  form.vagas.value = imovel.vagas || "";
  form.area.value =imovel.area || "";
  form.imagem_capa.value = imovel.imagem_capa || "";
  form.descricao.value = imovel.descricao || "";
  document.getElementById("form-title").textContent = "Editar Imóvel";
}

function clearForm() {
  const form = document.getElementById("imovel-form");
  form.reset();
  form.id.value = "";
  document.getElementById("form-title").textContent = "Novo Imóvel";
}

function toPayload(formData) {
  return {
    titulo: String(formData.get("titulo") || "").trim(),
    descricao: String(formData.get("descricao") || "").trim(),
    preco: Number(formData.get("preco") || 0),
    tipo: String(formData.get("tipo") || "residencial").trim(),
    tipo_negocio: String(formData.get("tipo_negocio") || "venda").trim(),
    cidade: String(formData.get("cidade") || "").trim(),
    bairro: String(formData.get("bairro") || "").trim(),
    quartos: Number(formData.get("quartos") || 0),
    banheiros: Number(formData.get("banheiros") || 0),
    vagas: Number(formData.get("vagas") || 0),
    area: Number(formData.get("area") || 0),
    imagem_capa: String(formData.get("imagem_capa") || "").trim(),
    status: "disponivel",
  };
}

function bindPageEvents() {
  const form = document.getElementById("imovel-form");
  const feedback = document.getElementById("form-feedback");
  const btnNovo = document.getElementById("btn-novo");
  const btnCancelar = document.getElementById("btn-cancelar");
  const container = document.getElementById("imoveis-container");

  btnNovo?.addEventListener("click", clearForm);
  btnCancelar?.addEventListener("click", clearForm);

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setFeedback(feedback, "Salvando...", "info");

    try {
      const formData = new FormData(form);
      const id = String(formData.get("id") || "").trim();
      const payload = toPayload(formData);

      if (id) {
        await atualizarImovel(id, payload);
        setFeedback(feedback, "Imóvel atualizado!", "success");
      } else {
        await criarImovel(payload);
        setFeedback(feedback, "Imóvel criado!", "success");
      }

      clearForm();
      imoveisCache = await getImoveisAdmin({ limit: 100 });
      container.innerHTML = imoveisCache.map(renderImovelItem).join("");
    } catch (error) {
      console.error(error);
      setFeedback(feedback, "Erro: " + error.message, "error");
    }
  });

  container?.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.classList.contains("btn-edit") ? "edit" : "delete";

    if (action === "delete") {
      if (!confirm("Tem certeza que deseja excluir este imóvel?")) return;
      setFeedback(feedback, "Excluindo...", "info");
      try {
        await removerImovel(id);
        imoveisCache = await getImoveisAdmin({ limit: 100 });
        container.innerHTML = imoveisCache.map(renderImovelItem).join("");
        setFeedback(feedback, "Imóvel excluído!", "success");
      } catch (error) {
        setFeedback(feedback, "Erro: " + error.message, "error");
      }
    }

    if (action === "edit") {
      try {
        const imovel = await getImovelById(id);
        fillForm(imovel);
        setFeedback(feedback, "", "info");
      } catch (error) {
        setFeedback(feedback, "Erro ao carregar imóvel", "error");
      }
    }
  });
}

async function init() {
  session = await requireAdminAccess();
  if (!session) return;

  const app = document.getElementById("admin-app");
  if (!app) return;

  try {
    imoveisCache = await getImoveisAdmin({ limit: 100 });
    app.innerHTML = renderPage(imoveisCache);
    bindAdminLayout();
    bindPageEvents();
  } catch (error) {
    console.error(error);
    app.innerHTML = "<p>Erro ao carregar imóveis.</p>";
  }
}

document.addEventListener("DOMContentLoaded", init);