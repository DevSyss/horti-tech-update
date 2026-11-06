/**
 * Configuração central do HortiTech.
 * Os caminhos abaixo correspondem aos @RequestMapping dos controllers Spring.
 */
window.APP_CONFIG = {
  API_BASE_URL: "http://localhost:8080",
  AUTH: {
    login: "/api/usuarios/login",
    // Esta rota cadastra o colaborador e cria a conta de usuário no backend.
    cadastro: "/api/colaboradores"
  },
  ENTITIES: {
    alertas: {
      label: "Alertas",
      endpoint: "/api/alerta",
      subtitle: "Acompanhe e gerencie as ocorrências do sistema.",
      columns: [
        { key: "mensagem", label: "Mensagem" },
        { key: "dataHora", label: "Data e hora" },
        { key: "status", label: "Situação" }
      ],
      fields: [
        { key: "mensagem", label: "Mensagem", type: "textarea", required: true, full: true },
        { key: "dataHora", label: "Data e hora", type: "datetime-local", required: true, max: "now", defaultNow: true },
        {
          key: "status", label: "Situação", type: "select", required: true,
          valueType: "boolean", defaultValue: "false",
          options: [
            { value: "false", label: "Pendente" },
            { value: "true", label: "Resolvido" }
          ]
        }
      ]
    },
    "camaras-frias": {
      label: "Câmaras frias",
      endpoint: "/api/camaraFria",
      subtitle: "Cadastre câmaras e configure os limites de temperatura.",
      columns: [
        { key: "nome", label: "Câmara" },
        { key: "local", label: "Local" },
        { key: "sensor", label: "Sensor" },
        { key: "temperaturaMinima", label: "Mínima (°C)" },
        { key: "temperaturaMaxima", label: "Máxima (°C)" }
      ],
      fields: [
        { key: "nome", label: "Nome da câmara", type: "text", required: true, pattern: "[\\p{L} ]+", maxLength: 100 },
        { key: "local", label: "Local", type: "text", required: true, maxLength: 150 },
        { key: "sensor", label: "Identificação do sensor", type: "text", required: true, maxLength: 100 },
        { key: "temperaturaMinima", label: "Temperatura mínima (°C)", type: "number", required: true, step: "any" },
        { key: "temperaturaMaxima", label: "Temperatura máxima (°C)", type: "number", required: true, step: "any" }
      ]
    },
    colaboradores: {
      label: "Colaboradores",
      endpoint: "/api/colaboradores",
      subtitle: "Contas cadastradas no sistema.",
      // A senha nunca é exibida na tabela.
      columns: [
        { key: "nome", label: "Nome" },
        { key: "cpf", label: "CPF" },
        { key: "email", label: "E-mail" }
      ],
      fields: [
        { key: "nome", label: "Nome completo", type: "text", required: true, pattern: "[\\p{L} ]+", maxLength: 150 },
        { key: "cpf", label: "CPF", type: "text", required: true, maxLength: 14, inputmode: "numeric", placeholder: "000.000.000-00" },
        // O serviço de colaboradores não sincroniza a alteração do e-mail com Usuario.
        // Por isso, o e-mail fica somente para leitura durante a edição.
        { key: "email", label: "E-mail", type: "email", required: true, maxLength: 120, readonlyOnEdit: true },
        { key: "senha", label: "Senha de acesso", type: "password", requiredOnCreate: true, createOnly: true, minLength: 6, autocomplete: "new-password" }
      ]
    },
    "registros-termicos": {
      label: "Registros térmicos",
      endpoint: "/api/registroTermico",
      subtitle: "Consulte e registre as leituras de temperatura e umidade.",
      columns: [
        { key: "temperatura", label: "Temperatura (°C)" },
        { key: "umidade", label: "Umidade (%)" },
        { key: "dataHora", label: "Data e hora" }
      ],
      fields: [
        { key: "temperatura", label: "Temperatura (°C)", type: "number", required: true, step: "any" },
        { key: "umidade", label: "Umidade (%)", type: "number", required: true, min: 0, max: 100, step: "any" },
        { key: "dataHora", label: "Data e hora", type: "datetime-local", required: true, max: "now", defaultNow: true }
      ]
    }
  }
};
