/* HortiTech Update — lógica específica da página: camaras-frias.js.
 * A apresentação fica nos arquivos CSS. A comunicação REST é feita por api.js.
 */

const formCadastro = document.getElementById("cameraForm");
formCadastro.addEventListener("submit", async function(event) {
    event.preventDefault();
    const camaraFria = {
        nome: document.getElementById("nome").value.trim(),
        local: document.getElementById("local").value.trim(),
        temperaturaMinima: document.getElementById("temperaturaMinima").value.trim(),
        temperaturaMaxima: document.getElementById("temperaturaMaxima").value.trim(),
        sensor: document.getElementById("sensor").value
    };
    try {
        const resposta = await fetch("http://localhost:8080/api/camaraFria", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(camaraFria)
        });
        
if (resposta.ok) {
    const dados = await resposta.json();
    localStorage.setItem(
        "cameraCadastrada",
        JSON.stringify(dados)
    );
    alert("Câmara cadastrada com sucesso!");
    window.location.href = "/index.html";
        } else {
            const erro = await resposta.text();
            console.error("Erro:", erro);
            alert("Erro ao cadastrar câmara fria.\n" + erro);
        }
    } catch (erro) {
        console.error("Erro de conexão:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
});















(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const pages = window.HortiTechPages;
    if (!pages || typeof pages.camarasFrias !== "function") {
      console.error("HortiTech Update: core.js não foi carregado ou não expõe a página camaras-frias.");
      return;
    }
    Promise.resolve(pages.camarasFrias()).catch(error => {
      console.error("Erro ao inicializar camaras-frias:", error);
      const target = document.querySelector("#pageContent, #records, #alertSummary");
      if (target) target.textContent = "Não foi possível carregar os dados. Confira a conexão com o backend e os endpoints configurados.";
    });
  }, { once: true });
})();
