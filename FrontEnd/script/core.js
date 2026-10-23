/* HortiTech Update — funções compartilhadas. O visual continua nos arquivos CSS. */
(() => {
  "use strict";
  const cfg = window.APP_CONFIG || {};
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const api = window.ApiClient.request;
  const PAGE_ENTITY = {
    "alerta.html": "alertas",
    "cadastroCamara.html": "camaras-frias",
    "historico.html": "registros-termicos",
    "informacoes.html": "colaboradores"
  };
  const currentPage = location.pathname.split("/").pop() || "index.html";
  const toast = (message, error = false) => {
    document.querySelector(".toast")?.remove();
    const el = document.createElement("div"); el.className = `toast${error ? " error" : ""}`; el.textContent = message;
    document.body.append(el); setTimeout(() => el.remove(), 4200);
  };
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const asRows = data => Array.isArray(data) ? data : (data?.content || data?.data || data?.registros || data?.items || []);
  const recordId = r => r?.id ?? r?.idAlerta ?? r?.idCamaraFria ?? r?.idColaborador ?? r?.idRegistroTermico ?? r?.idRegistro ?? r?.idUsuario;
  const formatDate = value => { if (!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? escapeHtml(value) : d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }); };
  const display = (row, key) => {
    let value = row?.[key];
    if (value && typeof value === "object") value = value.nome ?? value.nomeCamara ?? value.identificacao ?? value.email ?? value.id ?? "—";
    if (/data|hora|timestamp/i.test(key)) return formatDate(value);
    return value === null || value === undefined || value === "" ? "—" : escapeHtml(value);
  };
  function shell(title, subtitle) {
    if ($("#pageTitle")) $("#pageTitle").textContent = title;
    if ($("#pageSubtitle")) $("#pageSubtitle").textContent = subtitle;
    $$(".nav a").forEach(a => a.classList.toggle("active", a.dataset.page === currentPage));
    const theme = localStorage.getItem("hortitech_theme") || "light";
    document.documentElement.dataset.theme = theme;
    const themeBtn = $("#themeBtn");
    if (themeBtn) { themeBtn.textContent = theme === "dark" ? "☀" : "☾"; themeBtn.onclick = () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next; localStorage.setItem("hortitech_theme", next); themeBtn.textContent = next === "dark" ? "☀" : "☾";
      if (currentPage === "index.html") drawCharts(window.__dashboardData || []);
    }; }
    const menuBtn = $("#menuBtn"); if (menuBtn) menuBtn.onclick = () => $("#sidebar")?.classList.toggle("open");
    const logoutBtn = $("#logoutBtn"); if (logoutBtn) logoutBtn.onclick = () => { window.ApiClient.clearSession(); location.href = "login.html"; };
  }
  function openModal(title, fields, record, onSave) {
    const modal = $("#modal");
    modal.innerHTML = `<form class="modal" id="recordForm" novalidate><div class="modal-head"><h2>${escapeHtml(title)}</h2><button type="button" class="icon-btn" id="closeModal" aria-label="Fechar">×</button></div><div class="form-grid">${fields.map(f => {
      let value = record?.[f.key] ?? "";
      if (value && typeof value === "object") value = value.id ?? value.nome ?? "";
      const label = `<label for="field-${f.key}">${escapeHtml(f.label)}</label>`;
      if (f.type === "select") return `<div class="field"><label for="field-${f.key}">${escapeHtml(f.label)}</label><select id="field-${f.key}" name="${f.key}" ${f.required ? "required" : ""}><option value="">Selecione...</option>${(f.options || []).map(o => `<option value="${escapeHtml(o)}" ${String(value) === o ? "selected" : ""}>${escapeHtml(o)}</option>`).join("")}</select></div>`;
      if (f.type === "textarea") return `<div class="field full">${label}<textarea id="field-${f.key}" name="${f.key}" ${f.required ? "required" : ""}>${escapeHtml(value)}</textarea></div>`;
      return `<div class="field ${f.full ? "full" : ""}">${label}<input id="field-${f.key}" name="${f.key}" type="${f.type || "text"}" value="${escapeHtml(value)}" ${f.required ? "required" : ""} ${f.type === "number" ? 'step="any"' : ""} ${f.maxLength ? `maxlength="${f.maxLength}"` : ""}></div>`;
    }).join("")}</div><div class="modal-foot"><button type="button" class="btn secondary" id="cancelModal">Cancelar</button><button class="btn" type="submit">Salvar</button></div></form>`;
    modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
    const close = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); };
    $("#closeModal").onclick = $("#cancelModal").onclick = close;
    $("#recordForm").onsubmit = async event => {
      event.preventDefault(); const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form).entries());
      fields.forEach(f => { if (f.type === "number" && data[f.key] !== "") data[f.key] = Number(data[f.key]); if (data[f.key] === "") delete data[f.key]; });
      const saveBtn = $('button[type="submit"]', form); saveBtn.disabled = true; saveBtn.textContent = "Salvando...";
      try { await onSave(data); close(); } catch (err) { toast(err.message || "Não foi possível salvar.", true); saveBtn.disabled = false; saveBtn.textContent = "Salvar"; }
    };
    modal.onclick = e => { if (e.target === modal) close(); };
  }
  function tableMarkup(rows, fields) {
    if (!rows.length) return `<div class="empty">Nenhum registro encontrado. Use <b>＋ Novo registro</b> para cadastrar o primeiro.</div>`;
    return `<div class="table-scroll"><table><thead><tr>${fields.map(f => `<th>${escapeHtml(f.label)}</th>`).join("")}<th>AÇÕES</th></tr></thead><tbody>${rows.map(r => `<tr>${fields.map(f => `<td>${display(r, f.key)}</td>`).join("")}<td><div class="row-actions"><button class="mini-btn" data-edit="${escapeHtml(recordId(r))}">Editar</button><button class="mini-btn" data-delete="${escapeHtml(recordId(r))}">Excluir</button></div></td></tr>`).join("")}</tbody></table></div>`;
  }
  async function renderEntity(key) {
    const entity = cfg.ENTITIES[key]; if (!entity) throw new Error(`Entidade '${key}' não está configurada em script/config.js.`);
    shell(entity.label, entity.subtitle || `Consulte e gerencie ${entity.label.toLowerCase()} cadastrados no sistema.`);
    if ($("#entityTitle")) $("#entityTitle").textContent = `${entity.label} cadastrados`;
    let rows = [];
    const fields = entity.fields;
    const refresh = async () => {
      try { rows = asRows(await api(entity.endpoint)); paint(); }
      catch (err) { $("#records").innerHTML = `<div class="empty">Não foi possível consultar a API.<br><br><b>${escapeHtml(err.message)}</b><br><br>Confira o Spring Boot, a rota e a configuração CORS.</div>`; }
    };
    const paint = () => {
      const q = ($("#search")?.value || "").toLowerCase();
      const filtered = rows.filter(r => fields.some(f => String(r?.[f.key] ?? "").toLowerCase().includes(q)));
      $("#records").innerHTML = tableMarkup(filtered, fields);
      $$('[data-edit]', $("#records")).forEach(btn => btn.onclick = () => {
        const row = rows.find(r => String(recordId(r)) === btn.dataset.edit); if (!row) return;
        openModal(`Editar ${entity.label.toLowerCase()}`, fields, row, async data => {
          await api(`${entity.endpoint}/${encodeURIComponent(recordId(row))}`, { method: "PUT", body: JSON.stringify(data) }); toast("Registro atualizado com sucesso."); await refresh();
        });
      });
      $$('[data-delete]', $("#records")).forEach(btn => btn.onclick = async () => {
        if (!confirm("Deseja excluir este registro? Esta ação não pode ser desfeita.")) return;
        try { await api(`${entity.endpoint}/${encodeURIComponent(btn.dataset.delete)}`, { method: "DELETE" }); toast("Registro excluído."); await refresh(); } catch (err) { toast(err.message, true); }
      });
    };
    if ($("#search")) $("#search").oninput = paint;
    if ($("#newBtn")) $("#newBtn").onclick = () => openModal(`Novo cadastro: ${entity.label.toLowerCase()}`, fields, {}, async data => {
      await api(entity.endpoint, { method: "POST", body: JSON.stringify(data) }); toast("Cadastro realizado com sucesso."); await refresh();
    });
    await refresh();
  }
  function drawCharts(rows) {
    const canvas = $("#tempChart"); if (!canvas) return;
    const rect = canvas.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    const ctx = canvas.getContext("2d"), dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width, h = rect.height, css = getComputedStyle(document.documentElement);
    const line = css.getPropertyValue("--line"), muted = css.getPropertyValue("--muted"), green = css.getPropertyValue("--green");
    ctx.clearRect(0, 0, w, h);
    const vals = rows.slice().sort((a,b) => new Date(a.dataHora ?? a.dataRegistro ?? a.timestamp ?? 0) - new Date(b.dataHora ?? b.dataRegistro ?? b.timestamp ?? 0)).map(r => Number(r.temperatura ?? r.temperaturaAtual ?? r.valorTemperatura)).filter(Number.isFinite).slice(-12);
    if (!vals.length) { ctx.fillStyle = muted; ctx.font = "13px DM Sans, sans-serif"; ctx.textAlign = "center"; ctx.fillText("Nenhum registro térmico encontrado no banco de dados.", w / 2, h / 2); return; }
    let min = Math.min(...vals), max = Math.max(...vals); if (min === max) { min -= 1; max += 1; } else { min -= .5; max += .5; }
    const pad = 24; ctx.font = "10px DM Sans, sans-serif"; ctx.strokeStyle = line; ctx.fillStyle = muted; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) { const y = pad + (h - pad * 2) * i / 4; ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(w - 8, y); ctx.stroke(); ctx.fillText((max - (max - min) * i / 4).toFixed(1), 0, y + 3); }
    const points = vals.map((v,i) => ({ x: 36 + (w - 48) * (vals.length === 1 ? .5 : i / (vals.length - 1)), y: pad + (h - pad * 2) * (max - v) / (max - min) }));
    const grad = ctx.createLinearGradient(0, pad, 0, h); grad.addColorStop(0, green + "55"); grad.addColorStop(1, green + "00");
    ctx.beginPath(); points.forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y)); ctx.lineTo(points.at(-1).x,h-pad); ctx.lineTo(points[0].x,h-pad); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); points.forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y)); ctx.strokeStyle = green; ctx.lineWidth = 2.5; ctx.stroke();
    points.forEach(p => { ctx.beginPath(); ctx.arc(p.x,p.y,3.5,0,Math.PI*2); ctx.fillStyle=green; ctx.fill(); });
  }
  async function renderDashboard() {
    shell("Visão geral", "Acompanhe a operação e a segurança térmica em um só lugar.");
    const get = async key => asRows(await api(cfg.ENTITIES[key].endpoint));
    let cams, regs, alerts, colabs;
    try { [cams, regs, alerts, colabs] = await Promise.all([get("camaras-frias"), get("registros-termicos"), get("alertas"), get("colaboradores")]); }
    catch (err) {
      ["sCamaras","sRegistros","sAlertas","sColabs"].forEach(id => { if ($("#"+id)) $("#"+id).textContent = "—"; });
      if ($("#alertSummary")) $("#alertSummary").innerHTML = `<div class="empty">Não foi possível carregar os dados reais.<br><br><b>${escapeHtml(err.message)}</b></div>`;
      if ($("#recentTable")) $("#recentTable").innerHTML = `<div class="empty">Confira o Spring Boot e os endpoints em <b>script/config.js</b>.</div>`;
      drawCharts([]); return;
    }
    window.__dashboardData = regs;
    $("#sCamaras").textContent = cams.length; $("#sRegistros").textContent = regs.length;
    $("#sAlertas").textContent = alerts.filter(a => !String(a.status || "").toLowerCase().includes("resolvido")).length; $("#sColabs").textContent = colabs.length;
    const active = alerts.slice(0, 5);
    $("#alertSummary").innerHTML = active.length ? active.map(a => `<div class="activity"><div class="activity-dot ${/cr[ií]tico|alto/i.test(a.nivel || "") ? "activity-dot-danger" : "activity-dot-normal"}"></div><div class="activity-content"><strong>${escapeHtml(a.titulo || a.mensagem || "Alerta")}</strong><span>${escapeHtml(a.nivel || "Sem nível")} · ${escapeHtml(a.status || "Sem status")}</span></div><span class="pill ${/cr[ií]tico|alto/i.test(a.nivel || "") ? "bad" : "warn"}">${escapeHtml(a.nivel || "Info")}</span></div>`).join("") : `<div class="empty">Nenhum alerta cadastrado.</div>`;
    const recentFields = [{key:"camaraFria",label:"Câmara fria"},{key:"temperatura",label:"Temperatura (°C)"},{key:"dataHora",label:"Data e hora"}];
    $("#recentTable").innerHTML = regs.length ? `<div class="table-scroll"><table><thead><tr>${recentFields.map(f=>`<th>${f.label}</th>`).join("")}</tr></thead><tbody>${regs.slice().sort((a,b)=>new Date(b.dataHora ?? b.dataRegistro ?? 0)-new Date(a.dataHora ?? a.dataRegistro ?? 0)).slice(0,5).map(r=>`<tr>${recentFields.map(f=>`<td>${display(r,f.key)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : `<div class="empty">Ainda não existem leituras térmicas cadastradas.</div>`;
    drawCharts(regs); window.addEventListener("resize", () => drawCharts(window.__dashboardData || []), { passive: true });
  }
  function authPage(register = false) {
    const form = $("#authForm"); if (!form) return;
    shellAuth();
    const toggle = $("#togglePass"); if (toggle) toggle.onclick = () => { const input = $('[name="senha"]'); input.type = input.type === "password" ? "text" : "password"; };
    const cpfInput = $("#cpf"); if (cpfInput) cpfInput.addEventListener("input", () => { const d = cpfInput.value.replace(/\D/g, "").slice(0,11); cpfInput.value = d.replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2"); });
    form.onsubmit = async e => {
      e.preventDefault(); if (!form.reportValidity()) return;
      const values = Object.fromEntries(new FormData(form).entries()); const btn = $('button[type="submit"]',form), oldText = btn.textContent;
      btn.disabled = true; btn.textContent = "Aguarde...";
      try {
        const email = String(values.email || "").trim().toLowerCase(); let endpoint, payload;
        if (register) {
          const cpf = String(values.cpf || "").replace(/\D/g, ""), nome = String(values.nome || "").trim();
          if (cpf.length !== 11) throw new Error("Informe um CPF com 11 dígitos.");
          if (!/^[\p{L} ]+$/u.test(nome)) throw new Error("O nome deve conter apenas letras e espaços.");
          payload = { nome, cpf, email, senha: values.senha, usuario: { email, senha: values.senha } }; endpoint = cfg.AUTH.cadastro;
        } else { payload = { email, senha: values.senha }; endpoint = cfg.AUTH.login; }
        const result = await api(endpoint, { method:"POST", body:JSON.stringify(payload) });
        if (register) { toast("Cadastro enviado com sucesso. Você já pode entrar."); setTimeout(() => location.href = "login.html", 700); return; }
        const token = result?.token || result?.accessToken || result?.jwt; if (token) sessionStorage.setItem("hortitech_token", token);
        sessionStorage.setItem("hortitech_user", JSON.stringify(result?.usuario || result?.colaborador || result?.user || { email }));
        location.href = "index.html";
      } catch (err) { toast(err.message || "Não foi possível concluir a operação.", true); btn.disabled = false; btn.textContent = oldText; }
    };
  }
  function shellAuth() { const theme = localStorage.getItem("hortitech_theme") || "light"; document.documentElement.dataset.theme = theme; }
  window.HortiTechPages = {
    login: () => authPage(false), cadastro: () => authPage(true), dashboard: renderDashboard,
    alertas: () => renderEntity("alertas"), camarasFrias: () => renderEntity("camaras-frias"),
    registrosTermicos: () => renderEntity("registros-termicos"), colaboradores: () => renderEntity("colaboradores")
  };
})();
