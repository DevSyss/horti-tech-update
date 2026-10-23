/* Configure apenas as rotas para corresponder aos @RequestMapping dos controllers Spring Boot. */
window.APP_CONFIG = {
  API_BASE_URL: "http://localhost:8080",
  AUTH: {
    login: "/api/usuarios/login",
    cadastro: "/api/colaboradores"
  },
  ENTITIES: {
    alertas: {
      label: "Alertas", endpoint: "/api/alertas",
      fields: [
        { key: "titulo", label: "Título", type: "text", required: true },
        { key: "mensagem", label: "Descrição", type: "textarea", required: true },
        { key: "nivel", label: "Nível", type: "select", options: ["Baixo", "Médio", "Alto", "Crítico"], required: true },
        { key: "status", label: "Status", type: "select", options: ["Aberto", "Em andamento", "Resolvido"], required: true }
      ]
    },
    "camaras-frias": {
      label: "Câmaras frias", endpoint: "/api/camaras-frias",
      subtitle: "Cadastre câmaras e mantenha os limites térmicos da operação organizados.",
      fields: [
        { key: "nome", label: "Nome / identificação", type: "text", required: true },
        { key: "temperaturaMinima", label: "Temperatura mínima (°C)", type: "number", required: true },
        { key: "temperaturaMaxima", label: "Temperatura máxima (°C)", type: "number", required: true },
        { key: "localizacao", label: "Localização", type: "text" },
        { key: "status", label: "Status", type: "select", options: ["Ativa", "Manutenção", "Inativa"], required: true }
      ]
    },
    colaboradores: {
      label: "Colaboradores", endpoint: "/api/colaboradores",
      fields: [
        { key: "nome", label: "Nome completo", type: "text", required: true },
        { key: "cpf", label: "CPF", type: "text", required: true },
        { key: "email", label: "E-mail", type: "email", required: true }
      ]
    },
    "registros-termicos": {
      label: "Registros térmicos", endpoint: "/api/registros-termicos",
      fields: [
        { key: "camaraFria", label: "Câmara fria (ID ou nome)", type: "text", required: true },
        { key: "temperatura", label: "Temperatura (°C)", type: "number", required: true },
        { key: "dataHora", label: "Data e hora", type: "datetime-local", required: true },
        { key: "observacao", label: "Observação", type: "textarea" }
      ]
    }
  }
};
