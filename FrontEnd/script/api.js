/**
 * Cliente HTTP centralizado para a API Spring Boot.
 * O navegador chama o backend; a conexão com MySQL é responsabilidade do backend.
 */
(() => {
  "use strict";

  const config = () => window.APP_CONFIG || {};
  const baseUrl = () => String(config().API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

  function messageFromPayload(payload, status) {
    if (typeof payload === "string" && payload.trim()) return payload.trim();
    if (payload && typeof payload === "object") {
      const direct = payload.message || payload.detail || payload.errorDescription || payload.title;
      if (direct) return String(direct);

      const errors = payload.errors || payload.fieldErrors || payload.violations;
      if (Array.isArray(errors) && errors.length) {
        return errors.map(item => {
          if (typeof item === "string") return item;
          return item.defaultMessage || item.message || item.field || JSON.stringify(item);
        }).join("; ");
      }
      if (errors && typeof errors === "object") {
        return Object.entries(errors).map(([field, value]) => `${field}: ${value}`).join("; ");
      }
    }

    if (status === 400) return "Os dados enviados são inválidos. Confira os campos e tente novamente.";
    if (status === 401) return "Sessão expirada ou credenciais inválidas.";
    if (status === 403) return "Você não tem permissão para realizar esta ação.";
    if (status === 404) return "O endereço solicitado não foi encontrado no backend.";
    if (status === 409) return "Já existe um registro com esses dados.";
    return `Falha na API (HTTP ${status}).`;
  }

  async function request(path, options = {}) {
    const controller = new AbortController();
    const { timeoutMs = 15000, headers: customHeaders = {}, ...requestOptions } = options;
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    const headers = new Headers(customHeaders);

    headers.set("Accept", "application/json");
    if (requestOptions.body !== undefined && !(requestOptions.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json; charset=UTF-8");
    }

    const url = `${baseUrl()}${String(path).startsWith("/") ? path : `/${path}`}`;

    try {
      const response = await fetch(url, {
        ...requestOptions,
        method: requestOptions.method || "GET",
        headers,
        signal: controller.signal,
        // A API fornecida não usa cookie de sessão. Omitir credenciais evita conflito de CORS.
        credentials: "omit",
        mode: "cors"
      });

      if (response.status === 204) return null;

      const raw = await response.text();
      let payload = null;
      if (raw) {
        try {
          payload = JSON.parse(raw);
        } catch {
          payload = raw;
        }
      }

      if (!response.ok) {
        const error = new Error(messageFromPayload(payload, response.status));
        error.status = response.status;
        error.payload = payload;
        throw error;
      }

      return payload;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("A API demorou para responder. Verifique se o Spring Boot está ativo.");
      }
      if (error instanceof TypeError) {
        throw new Error("Não foi possível acessar o Spring Boot. Confira http://localhost:8080, a origem do Live Server e o CORS.");
      }
      throw error;
    } finally {
      window.clearTimeout(timer);
    }
  }

  const api = {
    request,
    get: path => request(path),
    post: (path, data) => request(path, { method: "POST", body: JSON.stringify(data) }),
    put: (path, data) => request(path, { method: "PUT", body: JSON.stringify(data) }),
    patch: (path, data) => request(path, { method: "PATCH", body: JSON.stringify(data) }),
    delete: path => request(path, { method: "DELETE" }),
    clearSession: () => {
      sessionStorage.removeItem("hortitech_token");
      sessionStorage.removeItem("hortitech_user");
    }
  };

  window.ApiClient = api;
})();
