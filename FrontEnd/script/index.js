/* HortiTech Update — lógica específica da página: dashboard.js.
 * A apresentação fica nos arquivos CSS. A comunicação REST é feita por api.js.
 */
(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const pages = window.HortiTechPages;
    if (!pages || typeof pages.dashboard !== "function") {
      console.error("HortiTech Update: core.js não foi carregado ou não expõe a página dashboard.");
      return;
    }
    Promise.resolve(pages.dashboard()).catch(error => {
      console.error("Erro ao inicializar dashboard:", error);
      const target = document.querySelector("#pageContent, #records, #alertSummary");
      if (target) target.textContent = "Não foi possível carregar os dados. Confira a conexão com o backend e os endpoints configurados.";
    });
  }, { once: true });
})();
