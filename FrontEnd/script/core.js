/* HortiTech — inicialização das páginas, formulários, dashboard e operações REST. */
(() => {
  "use strict";

  const config = window.APP_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const api = (path, options) => window.ApiClient.request(path, options);
  const currentPage = location.pathname.split("/").filter(Boolean).pop() || "index.html";

  const pageKeys = {
    "alerta.html": "alertas",
    "cadastroCamara.html": "camaras-frias",
    "historico.html": "registros-termicos",
    "informacoes.html": "colaboradores"
  };

  const rowsOf = value => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.content)) return value.content;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.items)) return value.items;
    return [];
  };

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

  function notify(message, isError = false) {
    $(".toast")?.remove();
    const element = document.createElement("div");
    element.className = `toast${isError ? " error" : ""}`;
    element.setAttribute("role", isError ? "alert" : "status");
    element.textContent = message;
    document.body.append(element);
    window.setTimeout(() => element.remove(), 4500);
  }

  window.HortiTechUI = { notify };

  function localDateTimeValue(value = new Date()) {
    const offset = value.getTimezoneOffset() * 60000;
    return new Date(value.getTime() - offset).toISOString().slice(0, 16);
  }

  function dateForInput(value) {
    if (!value) return "";
    return String(value).slice(0, 16);
  }

  function formatValue(value, key = "") {
    if (value === null || value === undefined || value === "") return "—";
    if (/dataHora/i.test(key)) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? escapeHtml(value) : date.toLocaleString("pt-BR");
    }
    if (typeof value === "boolean") return value ? "Resolvido" : "Pendente";
    if (key === "temperatura" || key === "temperaturaMinima" || key === "temperaturaMaxima") {
      const number = Number(value);
      return Number.isFinite(number) ? number.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : escapeHtml(value);
    }
    if (key === "umidade") {
      const number = Number(value);
      return Number.isFinite(number) ? number.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : escapeHtml(value);
    }
    return escapeHtml(value);
  }

  function applyTheme(theme) {
    const selectedTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = selectedTheme;
    try {
      localStorage.setItem("hortitech_theme", selectedTheme);
    } catch {
      // O tema continua funcionando mesmo quando o navegador bloqueia o armazenamento local.
    }
    const button = $("#themeBtn");
    if (button) {
      button.textContent = selectedTheme === "dark" ? "☀" : "☾";
      button.setAttribute("aria-label", selectedTheme === "dark" ? "Ativar tema claro" : "Ativar tema escuro");
    }
  }

  function shell(title, subtitle) {
    if ($("#pageTitle")) $("#pageTitle").textContent = title;
    if ($("#pageSubtitle")) $("#pageSubtitle").textContent = subtitle;

    $$(".nav a").forEach(link => {
      link.classList.toggle("active", link.dataset.page === currentPage);
    });

    let savedTheme = "light";
    try {
      savedTheme = localStorage.getItem("hortitech_theme") || "light";
    } catch {
      savedTheme = "light";
    }
    applyTheme(savedTheme);

    const themeButton = $("#themeBtn");
    if (themeButton) {
      themeButton.onclick = () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    }

    const menuButton = $("#menuBtn");
    if (menuButton) {
      menuButton.onclick = () => $("#sidebar")?.classList.toggle("open");
    }

    const logoutButton = $("#logoutBtn");
    if (logoutButton) {
      logoutButton.onclick = () => {
        window.ApiClient.clearSession();
        location.href = "login.html";
      };
    }
  }

  function shellAuth() {
    let theme = "light";
    try {
      theme = localStorage.getItem("hortitech_theme") || "light";
    } catch {
      theme = "light";
    }
    document.documentElement.dataset.theme = theme;
  }

  function fieldMarkup(field, record, mode) {
    const value = record?.[field.key] ?? field.defaultValue ?? (field.defaultNow ? localDateTimeValue() : "");
    const required = Boolean(field.required || (mode === "create" && field.requiredOnCreate));
    const readonly = mode === "edit" && Boolean(field.readonlyOnEdit);
    const fullClass = field.full ? "full" : "";
    const id = `field-${field.key}`;
    const label = `<label for="${id}">${escapeHtml(field.label)}</label>`;
    const attributes = [
      required ? "required" : "",
      field.maxLength ? `maxlength="${Number(field.maxLength)}"` : "",
      field.minLength ? `minlength="${Number(field.minLength)}"` : "",
      field.pattern ? `pattern="${escapeHtml(field.pattern)}"` : "",
      field.placeholder ? `placeholder="${escapeHtml(field.placeholder)}"` : "",
      field.inputmode ? `inputmode="${escapeHtml(field.inputmode)}"` : "",
      field.autocomplete ? `autocomplete="${escapeHtml(field.autocomplete)}"` : "",
      readonly ? "readonly" : "",
      field.min !== undefined ? `min="${escapeHtml(field.min)}"` : "",
      field.max !== undefined ? `max="${escapeHtml(field.max === "now" ? localDateTimeValue() : field.max)}"` : "",
      field.step !== undefined ? `step="${escapeHtml(field.step)}"` : ""
    ].filter(Boolean).join(" ");

    if (field.type === "textarea") {
      return `<div class="field ${fullClass}">${label}<textarea id="${id}" name="${field.key}" ${attributes}>${escapeHtml(value)}</textarea></div>`;
    }

    if (field.type === "select") {
      const options = (field.options || []).map(option => {
        const item = typeof option === "object" ? option : { value: option, label: option };
        const selected = String(value) === String(item.value) ? "selected" : "";
        return `<option value="${escapeHtml(item.value)}" ${selected}>${escapeHtml(item.label)}</option>`;
      }).join("");
      return `<div class="field ${fullClass}">${label}<select id="${id}" name="${field.key}" ${attributes}><option value="">Selecione...</option>${options}</select></div>`;
    }

    return `<div class="field ${fullClass}">${label}<input id="${id}" name="${field.key}" type="${escapeHtml(field.type || "text")}" value="${escapeHtml(value)}" ${attributes}></div>`;
  }

  function openModal(title, entity, record, save) {
    const modal = $("#modal");
    if (!modal) {
      notify("Janela de cadastro não encontrada nesta página.", true);
      return;
    }

    const mode = record && record.id !== undefined && record.id !== null ? "edit" : "create";
    const fields = (entity.fields || []).filter(field => !(mode === "edit" && field.createOnly));
    const fieldsHtml = fields.map(field => fieldMarkup(field, record || {}, mode)).join("");

    modal.innerHTML = `
      <form class="modal" id="recordForm" novalidate>
        <div class="modal-head">
          <h2>${escapeHtml(title)}</h2>
          <button type="button" class="icon-btn" id="closeModal" aria-label="Fechar">×</button>
        </div>
        <div class="form-grid">${fieldsHtml}</div>
        <div class="modal-foot">
          <button type="button" class="btn secondary" id="cancelModal">Cancelar</button>
          <button class="btn" type="submit">Salvar</button>
        </div>
      </form>`;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    const close = () => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      modal.innerHTML = "";
    };

    $("#closeModal", modal).onclick = close;
    $("#cancelModal", modal).onclick = close;
    modal.onclick = event => {
      if (event.target === modal) close();
    };
    document.onkeydown = event => {
      if (event.key === "Escape" && modal.classList.contains("open")) close();
    };

    $("#recordForm", modal).onsubmit = async event => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;

      const payload = Object.fromEntries(new FormData(form).entries());
      fields.forEach(field => {
        if (field.type === "number") {
          payload[field.key] = payload[field.key] === "" ? null : Number(payload[field.key]);
        }
        if (field.type === "datetime-local" && payload[field.key]) {
          payload[field.key] = payload[field.key].length === 16 ? `${payload[field.key]}:00` : payload[field.key];
        }
        if (field.valueType === "boolean") payload[field.key] = payload[field.key] === "true";
        if (field.type === "text" && typeof payload[field.key] === "string") payload[field.key] = payload[field.key].trim();
        if (field.type === "email" && typeof payload[field.key] === "string") payload[field.key] = payload[field.key].trim().toLowerCase();
        if (field.key === "cpf" && typeof payload[field.key] === "string") payload[field.key] = payload[field.key].replace(/\D/g, "");
      });

      if (entity.endpoint === "/api/colaboradores" && !isValidCpf(payload.cpf)) {
        notify("Informe um CPF válido.", true);
        return;
      }
      if (entity.endpoint === "/api/camaraFria" && Number(payload.temperaturaMinima) > Number(payload.temperaturaMaxima)) {
        notify("A temperatura mínima não pode ser maior que a máxima.", true);
        return;
      }

      const button = $('button[type="submit"]', form);
      button.disabled = true;
      button.textContent = "Salvando...";
      try {
        await save(payload);
        close();
      } catch (error) {
        notify(error.message || "Não foi possível salvar o registro.", true);
        button.disabled = false;
        button.textContent = "Salvar";
      }
    };
  }

  function tableMarkup(data, columns) {
    if (!data.length) {
      return `<div class="empty">Nenhum registro encontrado. Use o botão de novo cadastro para adicionar o primeiro.</div>`;
    }

    const headings = columns.map(column => `<th>${escapeHtml(column.label)}</th>`).join("");
    const rows = data.map(record => {
      const cells = columns.map(column => `<td>${formatValue(record?.[column.key], column.key)}</td>`).join("");
      const id = escapeHtml(record?.id ?? "");
      return `<tr>${cells}<td><div class="row-actions">
        <button class="mini-btn" type="button" data-edit="${id}">Editar</button>
        <button class="mini-btn" type="button" data-delete="${id}">Excluir</button>
      </div></td></tr>`;
    }).join("");

    return `<div class="table-scroll"><table><thead><tr>${headings}<th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  async function renderEntity(key) {
    const entity = config.ENTITIES?.[key];
    if (!entity) throw new Error(`Entidade "${key}" não está configurada.`);

    shell(entity.label, entity.subtitle || `Gerencie ${entity.label.toLowerCase()}.`);
    if ($("#entityTitle")) $("#entityTitle").textContent = `${entity.label} cadastrados`;

    const recordsElement = $("#records");
    if (!recordsElement) return;
    let data = [];

    const paint = () => {
      const query = String($("#search")?.value || "").trim().toLocaleLowerCase("pt-BR");
      const columns = entity.columns || entity.fields;
      const filtered = data.filter(record => columns.some(column =>
        String(record?.[column.key] ?? "").toLocaleLowerCase("pt-BR").includes(query)
      ));
      recordsElement.innerHTML = tableMarkup(filtered, columns);

      $$('[data-edit]', recordsElement).forEach(button => {
        button.onclick = () => {
          const record = data.find(item => String(item.id) === button.dataset.edit);
          if (!record) return;
          openModal(`Editar ${entity.label.toLowerCase()}`, entity, record, async payload => {
            await api(`${entity.endpoint}/${encodeURIComponent(record.id)}`, {
              method: "PUT",
              body: JSON.stringify(payload)
            });
            notify("Registro atualizado com sucesso.");
            await refresh();
          });
        };
      });

      $$('[data-delete]', recordsElement).forEach(button => {
        button.onclick = async () => {
          if (!window.confirm("Deseja excluir este registro permanentemente?")) return;
          button.disabled = true;
          try {
            await window.ApiClient.delete(`${entity.endpoint}/${encodeURIComponent(button.dataset.delete)}`);
            notify("Registro excluído com sucesso.");
            await refresh();
          } catch (error) {
            notify(error.message, true);
            button.disabled = false;
          }
        };
      });

      if (key === "alertas") updateAlertCounters(data);
    };

    const refresh = async () => {
      recordsElement.innerHTML = `<div class="empty">Carregando dados da API...</div>`;
      try {
        data = rowsOf(await api(entity.endpoint));
        paint();
      } catch (error) {
        recordsElement.innerHTML = `<div class="empty">Não foi possível carregar os dados.<br><br><b>${escapeHtml(error.message)}</b><br><br>Confira se o Spring Boot está ativo em http://localhost:8080.</div>`;
        if (key === "alertas") updateAlertCounters([]);
      }
    };

    if ($("#search")) $("#search").oninput = paint;

    const newButton = $("#newBtn");
    if (newButton) {
      newButton.onclick = () => openModal(`Novo cadastro: ${entity.label.toLowerCase()}`, entity, {}, async payload => {
        await api(entity.endpoint, { method: "POST", body: JSON.stringify(payload) });
        notify("Cadastro salvo com sucesso.");
        await refresh();
      });
    }

    const refreshButton = $("#refreshBtn");
    if (refreshButton) refreshButton.onclick = refresh;

    await refresh();
  }

  function updateAlertCounters(alerts) {
    const total = alerts.length;
    const resolved = alerts.filter(alert => alert.status === true).length;
    const active = total - resolved;
    if ($("#totalAlerts")) $("#totalAlerts").textContent = total;
    if ($("#activeAlerts")) $("#activeAlerts").textContent = active;
    if ($("#resolvedAlerts")) $("#resolvedAlerts").textContent = resolved;
  }

  function isValidCpf(value) {
    const cpf = String(value || "").replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    const calculateDigit = length => {
      let sum = 0;
      for (let index = 0; index < length; index++) sum += Number(cpf[index]) * (length + 1 - index);
      const remainder = (sum * 10) % 11;
      return remainder === 10 ? 0 : remainder;
    };

    return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
  }

  function authPage(register = false) {
    const form = $("#authForm");
    if (!form) return;
    shellAuth();

    const toggleButton = $("#togglePass");
    if (toggleButton) {
      toggleButton.onclick = () => {
        const passwordInput = $("#senha");
        if (!passwordInput) return;
        const showing = passwordInput.type === "password";
        passwordInput.type = showing ? "text" : "password";
        toggleButton.setAttribute("aria-label", showing ? "Ocultar senha" : "Mostrar senha");
      };
    }

    const cpfInput = $("#cpf");
    if (cpfInput) {
      cpfInput.oninput = () => {
        const digits = cpfInput.value.replace(/\D/g, "").slice(0, 11);
        cpfInput.value = digits
          .replace(/^(\d{3})(\d)/, "$1.$2")
          .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
          .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      };
    }

    form.onsubmit = async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const values = Object.fromEntries(new FormData(form).entries());
      const button = $('button[type="submit"]', form);
      const originalText = button?.textContent || "Entrar";
      if (button) {
        button.disabled = true;
        button.textContent = "Aguarde...";
      }

      try {
        const email = String(values.email || "").trim().toLowerCase();
        const senha = String(values.senha || "");
        if (!email || !senha) throw new Error("Preencha o e-mail e a senha.");

        if (register) {
          const nome = String(values.nome || "").trim().replace(/\s+/g, " ");
          const cpf = String(values.cpf || "").replace(/\D/g, "");
          if (!/^[\p{L} ]+$/u.test(nome)) throw new Error("O nome deve conter apenas letras e espaços.");
          if (!isValidCpf(cpf)) throw new Error("Informe um CPF válido.");
          if (senha.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres.");

          // ColaboradoresServices.salvar também cria o usuário usado pela rota de login.
          await window.ApiClient.post(config.AUTH.cadastro, { nome, cpf, email, senha });
          notify("Conta criada com sucesso! Redirecionando para o login.");
          window.setTimeout(() => { location.href = "login.html"; }, 900);
          return;
        }

        const result = await window.ApiClient.post(config.AUTH.login, { email, senha });
        if (!result || !result.id) throw new Error("E-mail ou senha incorretos.");

        sessionStorage.setItem("hortitech_user", JSON.stringify({
          id: result.id,
          email: result.email || email
        }));
        location.href = "index.html";
      } catch (error) {
        notify(error.message || "Não foi possível concluir a operação.", true);
        if (button) {
          button.disabled = false;
          button.textContent = originalText;
        }
      }
    };
  }

  function drawChart(records) {
    const canvas = $("#tempChart");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const width = rect.width;
    const height = rect.height;
    context.clearRect(0, 0, width, height);

    const values = records
      .map(record => Number(record.temperatura))
      .filter(Number.isFinite)
      .slice(-12);

    const style = getComputedStyle(document.documentElement);
    const color = style.getPropertyValue("--green").trim() || "#4c9b68";
    context.strokeStyle = color;
    context.fillStyle = style.getPropertyValue("--muted").trim() || "#718078";
    context.font = "12px sans-serif";

    if (!values.length) {
      context.textAlign = "center";
      context.fillText("Sem dados térmicos", width / 2, height / 2);
      return;
    }

    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) {
      min -= 1;
      max += 1;
    }

    const points = values.map((value, index) => ({
      x: 25 + (width - 40) * (values.length === 1 ? 0.5 : index / (values.length - 1)),
      y: 15 + (height - 35) * (max - value) / (max - min)
    }));

    context.lineWidth = 1;
    for (let index = 0; index < 4; index++) {
      const y = 15 + (height - 35) * index / 3;
      context.globalAlpha = 0.2;
      context.beginPath();
      context.moveTo(20, y);
      context.lineTo(width - 8, y);
      context.stroke();
    }

    context.globalAlpha = 1;
    context.beginPath();
    points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
    context.lineWidth = 2.5;
    context.stroke();

    points.forEach(point => {
      context.beginPath();
      context.arc(point.x, point.y, 3, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();
    });
  }

  let dashboardRecords = [];

  async function renderDashboard() {
    shell("Visão geral", "Acompanhe a operação e a segurança térmica em um só lugar.");

    const entityKeys = ["camaras-frias", "registros-termicos", "alertas", "colaboradores"];
    const results = await Promise.allSettled(entityKeys.map(key => api(config.ENTITIES[key].endpoint).then(rowsOf)));
    const data = {};
    entityKeys.forEach((key, index) => {
      data[key] = results[index].status === "fulfilled" ? results[index].value : null;
    });

    const cameras = data["camaras-frias"];
    const records = data["registros-termicos"];
    const alerts = data.alertas;
    const collaborators = data.colaboradores;

    if ($("#sCamaras")) $("#sCamaras").textContent = cameras ? cameras.length : "—";
    if ($("#sRegistros")) $("#sRegistros").textContent = records ? records.length : "—";
    if ($("#sAlertas")) $("#sAlertas").textContent = alerts ? alerts.filter(alert => alert.status !== true).length : "—";
    if ($("#sColabs")) $("#sColabs").textContent = collaborators ? collaborators.length : "—";

    if ($("#alertSummary")) {
      if (alerts) {
        $("#alertSummary").innerHTML = alerts.slice(-5).reverse().map(alert => `
          <div class="activity">
            <div class="activity-dot ${alert.status ? "activity-dot-normal" : "activity-dot-danger"}"></div>
            <div class="activity-content">
              <strong>${escapeHtml(alert.mensagem)}</strong>
              <span>${formatValue(alert.dataHora, "dataHora")}</span>
            </div>
            <span class="pill ${alert.status ? "good" : "warn"}">${alert.status ? "Resolvido" : "Pendente"}</span>
          </div>`).join("") || `<div class="empty">Nenhum alerta cadastrado.</div>`;
      } else {
        $("#alertSummary").innerHTML = `<div class="empty">Não foi possível consultar os alertas. Confira o Spring Boot e a conexão com a API.</div>`;
      }
    }

    if ($("#recentTable")) {
      if (records) {
        $("#recentTable").innerHTML = records.length ? `
          <div class="table-scroll"><table>
            <thead><tr><th>Temperatura</th><th>Umidade</th><th>Data e hora</th></tr></thead>
            <tbody>${records.slice(-5).reverse().map(record => `
              <tr><td>${formatValue(record.temperatura, "temperatura")} °C</td>
              <td>${formatValue(record.umidade, "umidade")} %</td>
              <td>${formatValue(record.dataHora, "dataHora")}</td></tr>`).join("")}
            </tbody>
          </table></div>` : `<div class="empty">Ainda não existem registros térmicos.</div>`;
      } else {
        $("#recentTable").innerHTML = `<div class="empty">Não foi possível carregar as leituras. Confira a API.</div>`;
      }
    }

    dashboardRecords = records || [];
    drawChart(dashboardRecords);
  }

  window.HortiTechPages = {
    login: () => authPage(false),
    cadastro: () => authPage(true),
    dashboard: renderDashboard,
    alertas: () => renderEntity("alertas"),
    camarasFrias: () => renderEntity("camaras-frias"),
    registrosTermicos: () => renderEntity("registros-termicos"),
    colaboradores: () => renderEntity("colaboradores")
  };

  document.addEventListener("DOMContentLoaded", () => {
    const protectedPages = new Set([
      "index.html", "alerta.html", "cadastroCamara.html", "historico.html",
      "informacoes.html", "suporte.html"
    ]);
    if (protectedPages.has(currentPage) && !sessionStorage.getItem("hortitech_user")) {
      location.replace("login.html");
      return;
    }

    const entityKey = pageKeys[currentPage];
    if (entityKey) {
      const pageMethod = {
        alertas: "alertas",
        "camaras-frias": "camarasFrias",
        "registros-termicos": "registrosTermicos",
        colaboradores: "colaboradores"
      }[entityKey];
      window.HortiTechPages[pageMethod]().catch(error => notify(error.message, true));
      return;
    }

    if (currentPage === "index.html") {
      renderDashboard().catch(error => notify(error.message, true));
      return;
    }
    if (currentPage === "login.html") authPage(false);
    if (currentPage === "cadastro.html") authPage(true);
    if (currentPage === "suporte.html") shell("Suporte", "Encontre orientações rápidas para usar o sistema com segurança.");
  });

  window.addEventListener("resize", () => {
    if (currentPage === "index.html") drawChart(dashboardRecords);
  });
})();
