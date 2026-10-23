/**
 * Cliente HTTP centralizado.
 * O navegador conversa com a API REST do Spring Boot; nunca se conecta ao MySQL diretamente.
 */
(() => {
  "use strict";
  const config = () => window.APP_CONFIG || {};
  const getToken = () => sessionStorage.getItem("hortitech_token");
  const normalizeBase = () => (config().API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

  async function request(path, options = {}) {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? 15000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const headers = new Headers(options.headers || {});
    const token = getToken();

    if (options.body !== undefined && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);

    const fetchOptions = {
      method: options.method || "GET",
      headers,
      signal: controller.signal,
      credentials: "include",
      ...options
    };
    delete fetchOptions.timeoutMs;
    fetchOptions.headers = headers;
    fetchOptions.signal = controller.signal;

    try {
      const response = await fetch(`${normalizeBase()}${path.startsWith("/") ? path : `/${path}`}`, fetchOptions);
      if (response.status === 204) return null;
      const raw = await response.text();
      let payload = null;
      try { payload = raw ? JSON.parse(raw) : null; } catch { payload = raw; }

      if (!response.ok) {
        const message = typeof payload === "string" ? payload :
          payload?.message || payload?.detail || payload?.error ||
          (response.status === 401 ? "Sessão expirada ou credenciais inválidas." :
           response.status === 403 ? "Você não tem permissão para realizar esta ação." :
           `Falha na API (HTTP ${response.status}).`);
        const error = new Error(message);
        error.status = response.status;
        error.payload = payload;
        throw error;
      }
      return payload;
    } catch (error) {
      if (error.name === "AbortError") throw new Error("A API demorou para responder. Verifique se o Spring Boot está ativo.");
      if (error instanceof TypeError) throw new Error("Não foi possível acessar o Spring Boot. Confira a URL, o servidor e a configuração CORS.");
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  const json = (method, data) => ({ method, body: JSON.stringify(data) });
  const api = {
    request,
    get: path => request(path),
    post: (path, data) => request(path, json("POST", data)),
    put: (path, data) => request(path, json("PUT", data)),
    patch: (path, data) => request(path, json("PATCH", data)),
    delete: path => request(path, { method: "DELETE" }),
    clearSession: () => { sessionStorage.removeItem("hortitech_token"); sessionStorage.removeItem("hortitech_user"); }
  };
  window.ApiClient = api;
})();
