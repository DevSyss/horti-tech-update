(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const themeBtn = document.querySelector("#themeBtn");
    const setTheme = theme => { document.documentElement.dataset.theme = theme; if (themeBtn) themeBtn.textContent = theme === "dark" ? "☀" : "☾"; };
    setTheme(localStorage.getItem("hortitech_theme") || "light");
    if (themeBtn) themeBtn.addEventListener("click", () => { const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; localStorage.setItem("hortitech_theme", next); setTheme(next); });
    document.querySelector("#menuBtn")?.addEventListener("click", () => document.querySelector("#sidebar")?.classList.toggle("open"));
    document.querySelector("#logoutBtn")?.addEventListener("click", () => { window.ApiClient.clearSession(); location.href = "login.html"; });
    const form = document.querySelector("#supportForm");
    form?.addEventListener("submit", event => { event.preventDefault(); if (!form.reportValidity()) return; const data = Object.fromEntries(new FormData(form).entries()); const subject = `[HortiTech Update] ${data.assunto}`; const body = `Nome: ${data.nome}\nE-mail: ${data.email}\nAssunto: ${data.assunto}\n\nDescrição:\n${data.mensagem}`; const recipient = window.APP_CONFIG?.SUPPORT_EMAIL || "suporte@hortitech.local"; window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; });
  });
})();
