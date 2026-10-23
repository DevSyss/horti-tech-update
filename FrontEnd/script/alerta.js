
(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", async () => {
        const records = document.getElementById("records");
        const search = document.getElementById("search");
        const refreshBtn = document.getElementById("refreshBtn");

        let alerts = [];

        function valueOf(item, keys, fallback = "—") {
            for (const key of keys) {
                if (item?.[key] !== undefined && item[key] !== null
                    && item[key] !== "") {
                    return item[key];
                }
            }
            return fallback;
        }

        function escapeHtml(value) {
            return String(value ?? "").replace(/[&<>"']/g, char => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[char]);
        }

        function statusOf(item) {
            const raw = String(valueOf(item,
                ["status", "situacao", "estado", "resolvido"],
                "Ativo")).toLowerCase();

            if (raw === "true" || raw.includes("resolvido")
                || raw.includes("encerrado") || raw.includes("inativo")) {
                return "Resolvido";
            }

            if (raw.includes("false") || raw.includes("ativo")
                || raw.includes("aberto") || raw.includes("pendente")) {
                return "Ativo";
            }

            return raw.charAt(0).toUpperCase() + raw.slice(1);
        }

        function dateOf(item) {
            const raw = valueOf(item,
                ["dataHora", "data", "dataCriacao", "dataAlerta", "createdAt"],
                "");

            if (!raw) return "Data não informada";

            const date = new Date(raw);
            return Number.isNaN(date.getTime())
                ? String(raw)
                : date.toLocaleString("pt-BR");
        }

        function updateSummary(list) {
            const total = document.getElementById("totalAlerts");
            const active = document.getElementById("activeAlerts");
            const resolved = document.getElementById("resolvedAlerts");

            if (total) total.textContent = list.length;
            if (active) {
                active.textContent = list.filter(a =>
                    statusOf(a).toLowerCase() === "ativo").length;
            }
            if (resolved) {
                resolved.textContent = list.filter(a =>
                    statusOf(a).toLowerCase() === "resolvido").length;
            }
        }

        function render(list) {
            updateSummary(list);

            if (!list.length) {
                records.innerHTML = `
                    <div class="empty">
                        <strong>Nenhum alerta encontrado</strong>
                        <p>Quando a API retornar alertas, eles aparecerão aqui.</p>
                    </div>`;
                return;
            }

            records.innerHTML = `
                <div class="alert-list">
                    ${list.map(item => {
                        const title = valueOf(item,
                            ["titulo", "nome", "tipo", "descricao", "mensagem"],
                            "Alerta do sistema");

                        const description = valueOf(item,
                            ["descricao", "mensagem", "detalhes"],
                            "Sem detalhes adicionais.");

                        const camera = valueOf(item,
                            ["camaraFriaNome", "nomeCamara", "camara", "camera"],
                            "Câmara não identificada");

                        const status = statusOf(item);
                        const normalized = status.toLowerCase();
                        const statusClass = normalized === "ativo"
                            ? "is-active"
                            : normalized === "resolvido"
                                ? "is-resolved" : "is-other";

                        return `
                            <article class="alert-card">
                                <div class="alert-card-icon" aria-hidden="true">!</div>
                                <div class="alert-card-content">
                                    <div class="alert-card-heading">
                                        <h3>${escapeHtml(title)}</h3>
                                        <span class="alert-status ${statusClass}">
                                            ${escapeHtml(status)}
                                        </span>
                                    </div>
                                    <p>${escapeHtml(description)}</p>
                                    <div class="alert-meta">
                                        <span>❄ ${escapeHtml(camera)}</span>
                                        <span>◷ ${escapeHtml(dateOf(item))}</span>
                                    </div>
                                </div>
                            </article>`;
                    }).join("")}
                </div>`;
        }

        async function loadAlerts() {
            records.innerHTML =
                '<div class="empty">Consultando alertas do backend...</div>';

            try {
                // Usa a camada de API já definida no projeto.
                const api = window.HortiTechAPI || window.api;
                let result;

                if (api && typeof api.get === "function") {
                    result = await api.get("/api/alertas");
                } else {
                    const base = window.API_BASE_URL
                        || window.HortiTechConfig?.API_BASE_URL
                        || window.HortiTechConfig?.apiBaseUrl
                        || "http://localhost:8080";

                    const response = await fetch(
                        `${base.replace(/\/$/, "")}/api/alertas`,
                        { headers: { Accept: "application/json" } }
                    );

                    if (!response.ok) {
                        throw new Error(`API respondeu HTTP ${response.status}`);
                    }

                    result = await response.json();
                }

                alerts = Array.isArray(result) ? result
                    : Array.isArray(result?.content) ? result.content
                    : Array.isArray(result?.data) ? result.data
                    : Array.isArray(result?.content?.data) ? result.content.data
                    : [];

                filterAlerts();
            } catch (error) {
                console.error("Erro ao carregar alertas:", error);
                records.innerHTML = `
                    <div class="empty">
                        <strong>Não foi possível carregar os alertas.</strong>
                        <p>Verifique se o Spring Boot está ativo e se a rota GET /api/alertas existe.</p>
                        <button class="btn" id="retryAlerts" type="button">
                            Tentar novamente
                        </button>
                    </div>`;

                document.getElementById("retryAlerts")
                    ?.addEventListener("click", loadAlerts);
            }
        }

        function filterAlerts() {
            const query = (search?.value || "").trim().toLowerCase();

            const filtered = alerts.filter(item => {
                const text = [
                    valueOf(item, ["titulo", "nome", "tipo", "descricao", "mensagem"], ""),
                    valueOf(item, ["status", "situacao", "estado"], ""),
                    valueOf(item, ["camaraFriaNome", "nomeCamara", "camara", "camera"], ""),
                    dateOf(item)
                ].join(" ").toLowerCase();

                return text.includes(query);
            });

            render(filtered);
        }

        search?.addEventListener("input", filterAlerts);
        refreshBtn?.addEventListener("click", loadAlerts);

        await loadAlerts();
    }, { once: true });
})();
