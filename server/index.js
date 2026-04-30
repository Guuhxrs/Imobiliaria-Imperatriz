import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import {
  autenticarAdministrador,
  atualizarImovel,
  atualizarContato,
  buscarImovelPorId,
  countAdministradores,
  criarContato,
  criarImovel,
  listarImoveis,
  listarContatos,
  limparContatosAntigos,
  removerImovel,
  uploadImagem,
} from "./supabase.js";
import {
  clearSessionCookie,
  getSessionFromRequest,
  hashSenha,
  setSessionCookie,
} from "./session.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Rate limiting simples (memória em memória)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 10; // máximo 10 requisições por janela

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  
  // Limpar janelas antigas
  const userHistory = rateLimitStore.get(ip) || [];
  const recentRequests = userHistory.filter(timestamp => timestamp > windowStart);
  
  if (recentRequests.length >= RATE_LIMIT_MAX) {
    res.status(429).json({ error: "Muitas requisicoes. Tente novamente em 1 minuto." });
    return;
  }
  
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  next();
}

// Proteção básica de headers
app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));

function serveStaticUrl(urlPath, filePath) {
  app.get(urlPath, (req, res) => {
    res.sendFile(path.join(rootDir, filePath));
  });
}

function requireAdmin(req, res, next) {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Nao autenticado." });
    return;
  }

  req.admin = session;
  next();
}

function asyncHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message || "Erro inesperado." });
    }
  };
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get(
  "/api/admin/bootstrap-status",
  asyncHandler(async (req, res) => {
    res.json({ totalAdministradores: await countAdministradores() });
  })
);

app.post(
  "/api/admin/login",
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const senha = String(req.body?.senha || "");

    if (!email || !senha) {
      res.status(422).json({ error: "Email e senha sao obrigatorios." });
      return;
    }

    const admin = await autenticarAdministrador(email, hashSenha(senha));
    setSessionCookie(res, admin);
    res.json({ admin });
  })
);

app.post("/api/admin/logout", (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get("/api/admin/session", (req, res) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Sessao expirada." });
    return;
  }

  res.json({ admin: session });
});

app.get(
  "/api/imoveis",
  asyncHandler(async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const imoveis = await listarImoveis({
      limit,
      cidade: req.query.cidade,
      tipo: req.query.tipo,
      status: req.query.status,
      search: req.query.search,
      tipo_negocio: req.query.tipo_negocio,
    });
    res.json({ imoveis });
  })
);

app.get(
  "/api/imoveis/:id",
  asyncHandler(async (req, res) => {
    res.json({ imovel: await buscarImovelPorId(req.params.id) });
  })
);

app.post(
  "/api/contatos",
  rateLimiter,
  asyncHandler(async (req, res) => {
    console.log("[API] POST /api/contatos - body:", req.body);
    const contato = await criarContato(req.body || {});
    res.status(201).json({ contato });
  })
);

app.get(
  "/api/admin/contatos",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const contatos = await listarContatos();
    res.json({ contatos });
  })
);

app.put(
  "/api/admin/contatos/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const contato = await atualizarContato(req.params.id, req.body || {});
    res.json({ contato });
  })
);

app.delete(
  "/api/admin/contatos/limpar",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const removidos = await limparContatosAntigos();
    res.json({ removidos: removidos.length });
  })
);

app.delete(
  "/api/contatos/limpar",
  asyncHandler(async (req, res) => {
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== process.env.CRON_API_KEY) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const removidos = await limparContatosAntigos();
    res.json({ removidos: removidos.length });
  })
);

app.get(
  "/api/admin/imoveis",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const imoveis = await listarImoveis({
      limit,
      cidade: req.query.cidade,
      tipo: req.query.tipo,
      status: req.query.status,
      search: req.query.search,
      tipo_negocio: req.query.tipo_negocio,
    });
    res.json({ imoveis });
  })
);

app.get(
  "/api/admin/imoveis/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json({ imovel: await buscarImovelPorId(req.params.id) });
  })
);

app.post(
  "/api/admin/imoveis",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const imovel = await criarImovel(req.body || {}, req.body?.imageUrls || []);
    res.status(201).json({ imovel });
  })
);

app.put(
  "/api/admin/imoveis/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const imovel = await atualizarImovel(req.params.id, req.body || {}, req.body?.imageUrls);
    res.json({ imovel });
  })
);

app.delete(
  "/api/admin/imoveis/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    await removerImovel(req.params.id);
    res.json({ ok: true });
  })
);

app.post(
  "/api/admin/upload",
  requireAdmin,
  upload.single("imagem"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(422).json({ error: "Arquivo de imagem obrigatorio." });
      return;
    }

    const publicUrl = await uploadImagem(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      String(req.body?.folder || "novo-imovel")
    );

    res.status(201).json({ url: publicUrl });
  })
);

serveStaticUrl("/", "index.html");
serveStaticUrl("/index.html", "index.html");
serveStaticUrl("/main.js", "main.js");
app.get("/app-config.js", (req, res) => {
  const apiBaseUrl = process.env.API_BASE_URL || "";
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
  res.type("application/javascript").send(
    `window.__APP_CONFIG__ = Object.freeze({ API_BASE_URL: ${JSON.stringify(apiBaseUrl)}, SUPABASE_URL: ${JSON.stringify(supabaseUrl)}, SUPABASE_ANON_KEY: ${JSON.stringify(supabaseAnonKey)} });`
  );
});
app.use("/src", express.static(path.join(rootDir, "src"), { index: false }));
app.use("/admin", express.static(path.join(rootDir, "admin"), { index: false }));

app.listen(config.port, () => {
  console.log(`Imperatriz Imoveis rodando em http://localhost:${config.port}`);
});
