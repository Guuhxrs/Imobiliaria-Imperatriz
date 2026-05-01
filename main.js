import { initRouter } from "./src/router.js";

function renderFatalError(title, message) {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = `<main class="container error-state"><h1>${title}</h1><pre>${message}</pre></main>`;
}

window.addEventListener("error", (event) => {
  console.error("Erro global:", event.error);
  renderFatalError("Algo deu errado", message);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Promise não tratada:", event.reason);
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initRouter();
  } catch (error) {
    console.error("Erro no initRouter:", error);
    renderFatalError("Ops! Algo deu errado", error.message);
  }
});
