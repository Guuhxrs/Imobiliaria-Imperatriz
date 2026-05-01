import {
  atualizarImovel,
  criarImovel,
  getImovelByIdAdmin,
  getImoveisAdmin,
  removerImovel,
  uploadImagemImovel,
} from "../api/imoveis.js";
import { renderAdminLayout, bindAdminLayout, setFeedback } from "./layout.js";
import { requireAdminAccess } from "./access.js";
import { escapeHtml, formatCurrencyBRL } from "../utils/helpers.js";

let session = null;
let imoveisCache = [];
let imageUrls = [];

function renderImovelItem(imovel) {
  return `
    <article class="imovel-item" data-id="${imovel.id}">
      <div class="imovel-thumb">
        ${imovel.imagem_capa ? `<img src="${escapeHtml(imovel.imagem_capa)}" alt="${escapeHtml(imovel.titulo)}" />` : "<span>Sem imagem</span>"}
      </div>
      <div class="imovel-info">
        <strong>${escapeHtml(imovel.titulo)}</strong>
        <p>${escapeHtml(imovel.bairro || "")}${imovel.cidade ? `, ${escapeHtml(imovel.cidade)}` : ""}</p>
        <span class="imovel-price">${formatCurrencyBRL(imovel.preco)}</span>
        <span class="imovel-status ${escapeHtml(imovel.status)}">${escapeHtml(imovel.status)}</span>
      </div>
      <div class="imovel-actions">
        <button type="button" class="primary-button btn-edit" data-id="${imovel.id}">Editar</button>
        <button type="button" class="danger-button btn-delete" data-id="${imovel.id}">Excluir</button>
      </div>
    </article>
  `;
}

function renderImagePreview() {
  const preview = document.getElementById("image-preview-list");
  const textarea = document.getElementById("image-urls");
  if (textarea) textarea.value = imageUrls.join("\n");
  if (!preview) return;

  preview.innerHTML = imageUrls.length
    ? imageUrls.map((url, index) => `
      <article class="image-preview-card">
        <img src="${escapeHtml(url)}" alt="Imagem ${index + 1}" />
        <p>${escapeHtml(url)}</p>
        <button type="button" class="ghost-button btn-remove-image" data-index="${index}">Remover</button>
      </article>
    `).join("")
    : '<p class="table-empty">Nenhuma imagem adicionada.</p>';
}

function renderPage(imoveis) {
  return renderAdminLayout({
    active: "imoveis",
    title: "Imóveis",
    subtitle: `${imoveis.length} imóvel(is) no catálogo.`,
    session,
    actions: '<button type="button" class="primary-button" id="btn-novo">Novo imóvel</button>',
    content: `
      <div class="imoveis-grid">
        <form id="imovel-form" class="imovel-form">
          <div class="form-heading">
            <span class="admin-kicker">Cadastro</span>
            <h2 id="form-title">Novo imóvel</h2>
          </div>
          <input type="hidden" name="id" />

          <div class="form-row">
            <label>Título<input name="titulo" required /></label>
            <label>Preço<input name="preco" type="number" min="0" required /></label>
          </div>

          <div class="form-row">
            <label>Cidade<input name="cidade" /></label>
            <label>Bairro<input name="bairro" /></label>
          </div>

          <div class="form-row">
            <label>Tipo
              <select name="tipo">
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
                <option value="terreno">Terreno</option>
              </select>
            </label>
            <label>Negócio
              <select name="tipo_negocio">
                <option value="venda">Venda</option>
                <option value="aluguel">Aluguel</option>
                <option value="ambos">Ambos</option>
              </select>
            </label>
            <label>Status
              <select name="status">
                <option value="disponivel">Disponível</option>
                <option value="vendido">Vendido</option>
                <option value="alugado">Alugado</option>
              </select>
            </label>
          </div>

          <div class="form-row four">
            <label>Quartos<input name="quartos" type="number" min="0" /></label>
            <label>Banheiros<input name="banheiros" type="number" min="0" /></label>
            <label>Vagas<input name="vagas" type="number" min="0" /></label>
            <label>Área (m²)<input name="area" type="number" min="0" /></label>
          </div>

          <label>Endereço<input name="endereco" /></label>
          <label>Descrição<textarea name="descricao" rows="5"></textarea></label>

          <div class="image-manager">
            <div class="image-toolbar">
              <label>Enviar imagem
                <input type="file" id="imagem-upload" accept="image/*" />
              </label>
              <button type="button" class="ghost-button" id="btn-upload">Adicionar imagem</button>
            </div>
            <label>URLs das imagens
              <textarea id="image-urls" rows="4" placeholder="Uma URL por linha"></textarea>
            </label>
            <div id="image-preview-list" class="image-preview-list"></div>
          </div>

          <div class="form-actions">
            <button type="submit" class="primary-button">Salvar</button>
            <button type="button" class="ghost-button" id="btn-cancelar">Cancelar</button>
          </div>
          <p id="form-feedback" class="feedback"></p>
        </form>

        <section class="imoveis-list">
          <div class="list-heading">
            <span class="admin-kicker">Catálogo</span>
            <h2>Imóveis cadastrados</h2>
          </div>
          <div id="imoveis-container">
            ${imoveis.length === 0 ? '<p class="table-empty">Nenhum imóvel cadastrado.</p>' : imoveis.map(renderImovelItem).join("")}
          </div>
        </section>
      </div>
    `,
  });
}

function setImageUrls(urls) {
  imageUrls = [...new Set((urls || []).map((url) => String(url || "").trim()).filter(Boolean))];
  renderImagePreview();
}

function fillForm(imovel) {
  const form = document.getElementById("imovel-form");
  if (!form) return;
  form.elements.id.value = imovel.id || "";
  form.titulo.value = imovel.titulo || "";
  form.preco.value = imovel.preco || "";
  form.cidade.value = imovel.cidade || "";
  form.bairro.value = imovel.bairro || "";
  form.endereco.value = imovel.endereco || "";
  form.tipo.value = imovel.tipo || "residencial";
  form.tipo_negocio.value = imovel.tipo_negocio || "venda";
  form.status.value = imovel.status || "disponivel";
  form.quartos.value = imovel.quartos || "";
  form.banheiros.value = imovel.banheiros || "";
  form.vagas.value = imovel.vagas || "";
  form.area.value = imovel.area || "";
  form.descricao.value = imovel.descricao || "";
  setImageUrls((imovel.imagens || []).map((imagem) => imagem.url).concat(imovel.imagem_capa || []));
  document.getElementById("form-title").textContent = "Editar imóvel";
}

function clearForm() {
  const form = document.getElementById("imovel-form");
  if (!form) return;
  form.reset();
  form.elements.id.value = "";
  setImageUrls([]);
  document.getElementById("form-title").textContent = "Novo imóvel";
}

function toPayload(formData) {
  return {
    titulo: String(formData.get("titulo") || "").trim(),
    descricao: String(formData.get("descricao") || "").trim(),
    preco: Number(formData.get("preco") || 0),
    tipo: String(formData.get("tipo") || "residencial").trim(),
    tipo_negocio: String(formData.get("tipo_negocio") || "venda").trim(),
    status: String(formData.get("status") || "disponivel").trim(),
    cidade: String(formData.get("cidade") || "").trim(),
    bairro: String(formData.get("bairro") || "").trim(),
    endereco: String(formData.get("endereco") || "").trim(),
    quartos: Number(formData.get("quartos") || 0),
    banheiros: Number(formData.get("banheiros") || 0),
    vagas: Number(formData.get("vagas") || 0),
    area: Number(formData.get("area") || 0),
  };
}

async function refreshList() {
  const container = document.getElementById("imoveis-container");
  imoveisCache = await getImoveisAdmin({ limit: 100 });
  if (container) container.innerHTML = imoveisCache.length ? imoveisCache.map(renderImovelItem).join("") : '<p class="table-empty">Nenhum imóvel cadastrado.</p>';
}

function bindPageEvents() {
  const form = document.getElementById("imovel-form");
  const feedback = document.getElementById("form-feedback");
  const container = document.getElementById("imoveis-container");
  const imageTextarea = document.getElementById("image-urls");

  document.getElementById("btn-novo")?.addEventListener("click", clearForm);
  document.getElementById("btn-cancelar")?.addEventListener("click", clearForm);
  imageTextarea?.addEventListener("input", () => setImageUrls(imageTextarea.value.split(/\r?\n/)));

  document.getElementById("btn-upload")?.addEventListener("click", async () => {
    const input = document.getElementById("imagem-upload");
    const file = input?.files?.[0];
    if (!file) {
      setFeedback(feedback, "Selecione uma imagem primeiro.", "error");
      return;
    }

    try {
      setFeedback(feedback, "Enviando imagem...", "info");
      const folder = form?.elements?.id?.value || "novo-imovel";
      const url = await uploadImagemImovel(file, { imovelId: folder });
      setImageUrls([...imageUrls, url]);
      input.value = "";
      setFeedback(feedback, "Imagem adicionada.", "success");
    } catch (error) {
      console.error(error);
      setFeedback(feedback, `Erro ao enviar imagem: ${error.message}`, "error");
    }
  });

  document.getElementById("image-preview-list")?.addEventListener("click", (event) => {
    const btn = event.target.closest(".btn-remove-image");
    if (!btn) return;
    imageUrls.splice(Number(btn.dataset.index), 1);
    setImageUrls(imageUrls);
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFeedback(feedback, "Salvando...", "info");

    try {
      const formData = new FormData(form);
      const id = String(formData.get("id") || "").trim();
      const payload = toPayload(formData);

      if (id) {
        await atualizarImovel(id, payload, { imageUrls });
        setFeedback(feedback, "Imóvel atualizado.", "success");
      } else {
        await criarImovel(payload, { imageUrls });
        setFeedback(feedback, "Imóvel criado.", "success");
      }

      clearForm();
      await refreshList();
    } catch (error) {
      console.error(error);
      setFeedback(feedback, `Erro: ${error.message}`, "error");
    }
  });

  container?.addEventListener("click", async (event) => {
    const btn = event.target.closest("button[data-id]");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.classList.contains("btn-edit") ? "edit" : "delete";

    if (action === "delete") {
      if (!confirm("Tem certeza que deseja excluir este imóvel?")) return;
      setFeedback(feedback, "Excluindo...", "info");
      try {
        await removerImovel(id);
        await refreshList();
        setFeedback(feedback, "Imóvel excluído.", "success");
      } catch (error) {
        setFeedback(feedback, `Erro: ${error.message}`, "error");
      }
    }

    if (action === "edit") {
      try {
        const imovel = await getImovelByIdAdmin(id);
        fillForm(imovel);
        setFeedback(feedback, "Imóvel carregado para edição.", "info");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        setFeedback(feedback, `Erro ao carregar imóvel: ${error.message}`, "error");
      }
    }
  });

  renderImagePreview();
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
    app.innerHTML = '<main class="admin-main"><p>Erro ao carregar imóveis.</p></main>';
  }
}

document.addEventListener("DOMContentLoaded", init);
