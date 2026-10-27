/* Configuração das rotas conforme os @RequestMapping do BackEnd HortiTech. */
window.APP_CONFIG = {
  API_BASE_URL: "http://localhost:8080",
  AUTH: { login: "/api/usuarios/login", cadastro: "/api/colaboradores" },
  ENTITIES: {
    alertas: { label: "Alertas", endpoint: "/api/alerta", subtitle: "Acompanhe e gerencie as ocorrências do sistema.", fields: [
      { key: "mensagem", label: "Mensagem", type: "textarea", required: true, full: true },
      { key: "dataHora", label: "Data e hora", type: "datetime-local", required: true },
      { key: "status", label: "Resolvido?", type: "select", options: [{value:"false",label:"Pendente"},{value:"true",label:"Resolvido"}], required: true, valueType:"boolean" }
    ]},
    "camaras-frias": { label: "Câmaras frias", endpoint: "/api/camaraFria", subtitle: "Cadastre câmaras e configure os limites de temperatura.", fields: [
      { key: "nome", label: "Nome da câmara", type: "text", required: true, pattern: "[\\p{L} ]+", maxLength: 100 },
      { key: "local", label: "Local", type: "text", required: true },
      { key: "sensor", label: "Identificação do sensor", type: "text", required: true },
      { key: "temperaturaMinima", label: "Temperatura mínima (°C)", type: "number", required: false },
      { key: "temperaturaMaxima", label: "Temperatura máxima (°C)", type: "number", required: true }
    ]},
    colaboradores: { label: "Colaboradores", endpoint: "/api/colaboradores", subtitle: "Contas cadastradas no sistema.", fields: [
      { key: "nome", label: "Nome", type: "text", required: true },
      { key: "cpf", label: "CPF", type: "text", required: true },
      { key: "email", label: "E-mail", type: "email", required: true }
    ]},
    "registros-termicos": { label: "Registros térmicos", endpoint: "/api/registroTermico", subtitle: "Consulte e registre as leituras de temperatura e umidade.", fields: [
      { key: "temperatura", label: "Temperatura (°C)", type: "number", required: true },
      { key: "umidade", label: "Umidade (%)", type: "number", required: true },
      { key: "dataHora", label: "Data e hora", type: "datetime-local", required: true }
    ]}
  }
};
