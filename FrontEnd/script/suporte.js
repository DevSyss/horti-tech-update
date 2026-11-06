/* O backend fornecido não possui endpoint de chamados; este formulário prepara um e-mail. */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const form = document.querySelector("#supportForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const values = Object.fromEntries(new FormData(form).entries());
    const subject = `[HortiTech] ${String(values.assunto || "Solicitação de suporte").trim()}`;
    const body = [
      `Nome: ${String(values.nome || "").trim()}`,
      `E-mail para retorno: ${String(values.email || "").trim()}`,
      `Assunto: ${String(values.assunto || "").trim()}`,
      "",
      "Descrição:",
      String(values.mensagem || "").trim()
    ].join("\n");

    // Sem endereço de suporte definido no projeto, o campo destinatário fica em branco.
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.HortiTechUI?.notify("Solicitação preparada no aplicativo de e-mail. Ela ainda não é gravada no sistema.");
  });
});
