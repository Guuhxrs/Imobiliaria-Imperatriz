import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const IMOVEIS_TABLE = "imoveis";
const IMAGENS_TABLE = "imagens_imovel";
const IMOVEL_SELECT = "*, imagens_imovel(id, url, created_at)";

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeText(value) {
  return String(value || "").trim();
}

function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  if (!phone) return false;
  const cleaned = String(phone).replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 15;
}

// Campos permitidos para criação de imóvel
const ALLOWED_FIELDS_IMOVEL = [
  'titulo', 'descricao', 'preco', 'tipo', 'status', 'tipo_negocio',
  'cidade', 'bairro', 'endereco', 'quartos', 'banheiros', 'vagas', 'area'
];

// Campos permitidos para criação de contato
const ALLOWED_FIELDS_CONTATO = [
  'nome', 'email', 'mensagem', 'imovel_id'
];

function normalizeImages(imagens = []) {
  return (Array.isArray(imagens) ? imagens : [])
    .map((imagem) => ({
      id: imagem.id,
      url: sanitizeText(imagem.url),
      created_at: imagem.created_at || null,
    }))
    .filter((imagem) => imagem.url);
}

function normalizeImovel(imovel) {
  const imagens = normalizeImages(imovel?.imagens_imovel);

  return {
    id: imovel.id,
    titulo: sanitizeText(imovel.titulo) || "Imovel sem titulo",
    descricao: sanitizeText(imovel.descricao),
    preco: toNumber(imovel.preco, 0),
    tipo: sanitizeText(imovel.tipo) || "residencial",
    status: sanitizeText(imovel.status) || "disponivel",
    tipo_negocio: sanitizeText(imovel.tipo_negocio) || "venda",
    cidade: sanitizeText(imovel.cidade),
    bairro: sanitizeText(imovel.bairro),
    endereco: sanitizeText(imovel.endereco),
    quartos: toNumber(imovel.quartos, 0),
    banheiros: toNumber(imovel.banheiros, 0),
    vagas: toNumber(imovel.vagas, 0),
    area: toNumber(imovel.area, 0),
    imagem_capa: imagens[0]?.url || "",
    imagens,
    created_at: imovel.created_at || null,
  };
}

function buildImovelPayload(payload) {
  const tipoNegocio = sanitizeText(payload.tipo_negocio) || "venda";
  if (!["venda", "aluguel", "ambos"].includes(tipoNegocio)) {
    throw new Error("tipo_negocio deve ser: venda, aluguel ou ambos");
  }

  // Filtrar apenas campos permitidos (prevenção mass assignment)
  const filtered = {};
  for (const key of ALLOWED_FIELDS_IMOVEL) {
    if (key in payload) {
      if (key === 'preco' || key === 'quartos' || key === 'banheiros' || key === 'vagas' || key === 'area') {
        filtered[key] = toNumber(payload[key], 0);
      } else {
        filtered[key] = sanitizeText(payload[key]);
      }
    }
  }
  
  return filtered;
}

function dedupeImageUrls(imageUrls = []) {
  return [...new Set((Array.isArray(imageUrls) ? imageUrls : []).map((url) => sanitizeText(url)).filter(Boolean))];
}

async function syncImagens(imovelId, imageUrls = []) {
  const { error: deleteError } = await supabase.from(IMAGENS_TABLE).delete().eq("imovel_id", imovelId);
  if (deleteError) throw new Error(`Erro ao limpar imagens: ${deleteError.message}`);

  const urls = dedupeImageUrls(imageUrls);
  if (!urls.length) return [];

  const { data, error } = await supabase
    .from(IMAGENS_TABLE)
    .insert(urls.map((url) => ({ imovel_id: imovelId, url })))
    .select("id, url, created_at");

  if (error) throw new Error(`Erro ao salvar imagens: ${error.message}`);
  return normalizeImages(data);
}

export async function countAdministradores() {
  const { count, error } = await supabase
    .from("administradores")
    .select("id", { count: "exact", head: true });

  if (error) throw new Error(`Erro ao contar administradores: ${error.message}`);
  return Number(count || 0);
}

export async function autenticarAdministrador(email, senhaHash) {
  const { data, error } = await supabase
    .from("administradores")
    .select("id, email, nome, senha_hash, created_at")
    .eq("email", sanitizeText(email).toLowerCase())
    .maybeSingle();

  if (error) throw new Error("Nao foi possivel validar o administrador.");
  if (!data || data.senha_hash !== senhaHash) throw new Error("Credenciais invalidas.");

  return {
    id: data.id,
    email: data.email,
    nome: data.nome || "Administrador",
    created_at: data.created_at || null,
  };
}

export async function listarImoveis({ limit, cidade, tipo, status, search, tipo_negocio } = {}) {
  let query = supabase.from(IMOVEIS_TABLE).select(IMOVEL_SELECT).order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);
  if (cidade) query = query.ilike("cidade", `%${sanitizeText(cidade)}%`);
  if (tipo) query = query.eq("tipo", sanitizeText(tipo));
  if (status) query = query.eq("status", sanitizeText(status));
  if (tipo_negocio) {
    const tipoSanitized = sanitizeText(tipo_negocio);
    if (tipoSanitized === "venda") {
      query = query.or("tipo_negocio.eq.venda,tipo_negocio.eq.ambos,tipo_negocio.is.null");
    } else if (tipoSanitized === "aluguel") {
      query = query.or("tipo_negocio.eq.aluguel,tipo_negocio.eq.ambos,tipo_negocio.is.null");
    } else {
      query = query.eq("tipo_negocio", tipoSanitized);
    }
  }
  if (search) {
    const term = sanitizeText(search);
    query = query.or(`titulo.ilike.%${term}%,cidade.ilike.%${term}%,bairro.ilike.%${term}%,endereco.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao buscar imoveis: ${error.message}`);
  return (data || []).map(normalizeImovel);
}

export async function buscarImovelPorId(id) {
  const { data, error } = await supabase
    .from(IMOVEIS_TABLE)
    .select(IMOVEL_SELECT)
    .eq("id", id)
    .single();

  if (error) throw new Error(`Erro ao buscar imovel: ${error.message}`);
  return normalizeImovel(data);
}

export async function criarImovel(payload, imageUrls = []) {
  const { data, error } = await supabase
    .from(IMOVEIS_TABLE)
    .insert(buildImovelPayload(payload))
    .select("id")
    .single();

  if (error) throw new Error(`Erro ao criar imovel: ${error.message}`);
  await syncImagens(data.id, imageUrls);
  return buscarImovelPorId(data.id);
}

export async function atualizarImovel(id, payload, imageUrls) {
  const { error } = await supabase
    .from(IMOVEIS_TABLE)
    .update(buildImovelPayload(payload))
    .eq("id", id);

  if (error) throw new Error(`Erro ao atualizar imovel: ${error.message}`);
  if (Array.isArray(imageUrls)) await syncImagens(id, imageUrls);
  return buscarImovelPorId(id);
}

export async function removerImovel(id) {
  const { error: imagensError } = await supabase.from(IMAGENS_TABLE).delete().eq("imovel_id", id);
  if (imagensError) throw new Error(`Erro ao remover imagens: ${imagensError.message}`);

  const { error } = await supabase.from(IMOVEIS_TABLE).delete().eq("id", id);
  if (error) throw new Error(`Erro ao remover imovel: ${error.message}`);
}

export async function criarContato(payload) {
  // Validação de email
  if (!isValidEmail(payload.email)) {
    throw new Error("Email invalido");
  }
  
  // Validação básica de nome e mensagem
  const nome = sanitizeText(payload.nome);
  const mensagem = sanitizeText(payload.mensagem);
  
  if (!nome || nome.length < 2) {
    throw new Error("Nome invalido");
  }
  if (!mensagem || mensagem.length < 5) {
    throw new Error("Mensagem invalida");
  }

  // Sanitização extra para prevenir XSS
  const sanitizedMessage = mensagem
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const dataToInsert = {
    nome: nome.substring(0, 100),
    email: payload.email.toLowerCase().substring(0, 200),
    mensagem: sanitizedMessage.substring(0, 2000),
    imovel_id: payload.imovel_id || null,
    respondido: false,
  };

  console.log("[DB] Inserting into contatos:", dataToInsert);
  const { data, error } = await supabase.from("contatos").insert(dataToInsert).select("*").single();
  if (error) {
    console.error("[DB] Erro ao criar contato:", error);
    throw new Error(`Erro ao criar contato: ${error.message}`);
  }
  return data;
}

export async function listarContatos() {
  const { data, error } = await supabase
    .from("contatos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Erro ao buscar contatos: ${error.message}`);
  return data || [];
}

export async function atualizarContato(id, payload) {
  const dataToUpdate = {};
  if (typeof payload.respondido === "boolean") {
    dataToUpdate.respondido = payload.respondido;
    if (payload.respondido) {
      dataToUpdate.respondido_em = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("contatos")
    .update(dataToUpdate)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Erro ao atualizar contato: ${error.message}`);
  return data;
}

export async function uploadImagem(buffer, originalName, mimeType, folder = "novo-imovel") {
  if (!config.storageBucket) {
    throw new Error("SUPABASE_STORAGE_BUCKET nao configurado. Defina a variavel SUPABASE_STORAGE_BUCKET no .env do servidor.");
  }

  const safeName = sanitizeText(originalName || "imagem")
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-");

  const filePath = `${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(config.storageBucket).upload(filePath, buffer, {
    contentType: mimeType || "application/octet-stream",
    upsert: false,
  });

  if (error) throw new Error(`Erro ao enviar imagem: ${error.message}`);

  const { data } = supabase.storage.from(config.storageBucket).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function limparContatosAntigos() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString();

  const { data, error } = await supabase
    .from("contatos")
    .delete()
    .eq("respondido", true)
    .lt("respondido_em", cutoffDate)
    .select("id");

  if (error) throw new Error(`Erro ao limpar contatos: ${error.message}`);
  return data || [];
}
