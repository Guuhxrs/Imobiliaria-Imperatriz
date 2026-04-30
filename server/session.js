import crypto from "node:crypto";
import { config } from "./config.js";

const COOKIE_NAME = "imperatriz_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function toBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value) {
  return crypto.createHmac("sha256", config.sessionSecret).update(value).digest("base64url");
}

export function hashSenha(senha) {
  return crypto.createHash("sha256").update(String(senha || "")).digest("hex");
}

export function createSessionValue(admin) {
  const payload = {
    id: admin.id,
    email: admin.email,
    nome: admin.nome || "Administrador",
    exp: Date.now() + SESSION_TTL_MS,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function parseSessionValue(rawValue) {
  if (!rawValue || !rawValue.includes(".")) return null;

  const [encodedPayload, signature] = rawValue.split(".");
  if (!encodedPayload || !signature) return null;
  if (sign(encodedPayload) !== signature) return null;

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload));
    if (!payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res, admin) {
  res.cookie(COOKIE_NAME, createSessionValue(admin), {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProduction,
    path: "/",
    maxAge: SESSION_TTL_MS,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProduction,
    path: "/",
  });
}

export function getSessionFromRequest(req) {
  return parseSessionValue(req.cookies?.[COOKIE_NAME] || "");
}
