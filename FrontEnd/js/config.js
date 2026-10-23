/* Ajuste esta configuração para combinar com seus controllers Spring Boot. */
window.APP_CONFIG = {
  API_BASE_URL: "http://localhost:8080", // URL base do Spring Boot; não coloque /api no final
  AUTH: {
    login: "/api/auth/login",
    cadastro: "/api/auth/cadastro"
  },
  ENTITIES: {
    alertas: {
      label: "Alertas", endpoint: "/api/alertas", icon: "◉",
      fields: [
        { key: "titulo", label: "Título", type: "text", required: true },
        { key: "mensagem", label: "Mensagem", type: "textarea", required: true },
        { key: "nivel", label: "Nível", type: "select", options: ["Baixo", "Médio", "Alto", "Crítico"], required: true },
        { key: "status", label: "Status", type: "select", options: ["Aberto", "Em andamento", "Resolvido"], required: true }
      ]
    },
    "camaras-frias": {
      label: "Câmaras frias", endpoint: "/api/camaras-frias", icon: "❄",
      fields: [
        { key: "nome", label: "Nome", type: "text", required: true },
        { key: "temperaturaAtual", label: "Temperatura atual (°C)", type: "number", required: true },
        { key: "temperaturaMinima", label: "Temperatura mínima (°C)", type: "number" },
        { key: "temperaturaMaxima", label: "Temperatura máxima (°C)", type: "number" },
        { key: "status", label: "Status", type: "select", options: ["Normal", "Atenção", "Crítico"], required: true }
      ]
    },
    colaboradores: {
      label: "Colaboradores", endpoint: "/api/colaboradores", icon: "♙",
      fields: [
        { key: "nome", label: "Nome completo", type: "text", required: true },
        { key: "email", label: "E-mail", type: "email", required: true },
        { key: "cargo", label: "Cargo", type: "text", required: true },
        { key: "telefone", label: "Telefone", type: "text" }
      ]
    },
    "registros-termicos": {
      label: "Registros térmicos", endpoint: "/api/registros-termicos", icon: "⌁",
      fields: [
        { key: "camaraFria", label: "Câmara fria", type: "text", required: true },
        { key: "temperatura", label: "Temperatura (°C)", type: "number", required: true },
        { key: "dataHora", label: "Data e hora", type: "datetime-local", required: true },
        { key: "observacao", label: "Observação", type: "text" }
      ]
    },
    usuarios: {
      label: "Usuários", endpoint: "/api/usuarios", icon: "♧",
      fields: [
        { key: "nome", label: "Nome", type: "text", required: true },
        { key: "email", label: "E-mail", type: "email", required: true },
        { key: "perfil", label: "Perfil", type: "select", options: ["Administrador", "Operador", "Visualizador"], required: true }
      ]
    }
  }
};
