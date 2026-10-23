/* HortiTech Update — lógica específica da página: registros-termicos.js.
 * A apresentação fica nos arquivos CSS. A comunicação REST é feita por api.js.
 */
(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const pages = window.HortiTechPages;
    if (!pages || typeof pages.registrosTermicos !== "function") {
      console.error("HortiTech Update: core.js não foi carregado ou não expõe a página registros-termicos.");
      return;
    }
    Promise.resolve(pages.registrosTermicos()).catch(error => {
      console.error("Erro ao inicializar registros-termicos:", error);
      const target = document.querySelector("#pageContent, #records, #alertSummary");
      if (target) target.textContent = "Não foi possível carregar os dados. Confira a conexão com o backend e os endpoints configurados.";
    });
  }, { once: true });
})();
