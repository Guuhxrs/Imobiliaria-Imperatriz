import { initRouter } from "./src/router.js";

window.addEventListener("error", (e) => {
  console.error("Erro global:", e.error);
  document.getElementById("app").innerHTML = `<div style="padding:20px;color:red;"><h1>Erro ao carregar</h1><pre>${e.error?.message || e.message}</pre></div>`;
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Promise não tratada:", e.reason);
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initRouter();
  } catch (err) {
    console.error("Erro no initRouter:", err);
    document.getElementById("app").innerHTML = `<div style="padding:20px;color:red;"><h1>Erro ao inicializar</h1><pre>${err.message}</pre></div>`;
  }
});
