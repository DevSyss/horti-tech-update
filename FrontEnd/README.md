# Hortitech Pro — Front-end

Frontend em HTML, CSS e JavaScript puro, com dashboard responsivo, tema claro/escuro, login/cadastro e CRUD para:
- Alertas
- Câmaras frias
- Colaboradores
- Registros térmicos
- Usuários

## Como executar
1. Extraia a pasta.
2. Abra `js/config.js` e configure `API_BASE_URL` para a URL da sua API Spring Boot.
3. Sirva a pasta com Live Server (recomendado) ou outro servidor estático.
4. Acesse `login.html`.

## Integração com Spring Boot
O frontend usa `fetch()` e espera endpoints REST. Os caminhos ficam em `js/config.js` e podem ser alterados sem mexer nas páginas.
Por padrão:
- `POST /api/auth/login` recebe `{ email, senha }` e retorna `{ token, usuario }` (ou um token simples).
- `POST /api/auth/cadastro` recebe `{ nome, email, senha }`.
- CRUD REST: `GET /api/{entidade}`, `GET /api/{entidade}/{id}`, `POST /api/{entidade}`, `PUT /api/{entidade}/{id}`, `DELETE /api/{entidade}/{id}`.

Se seu backend usa outros caminhos ou nomes de campos, ajuste `js/config.js` e os campos de formulário em `js/app.js`.
O frontend guarda token no `sessionStorage`. Para produção, prefira cookies HttpOnly e implemente autenticação/autorização no Spring Security.

## Importante
Como o código do seu backend Spring Boot e os nomes exatos dos campos/endpoints não foram anexados, a integração está preparada para REST, mas pode precisar de pequenos ajustes conforme seus controllers e DTOs reais.


## Atualização visual
A versão aprimorada usa verde pastel, fundos claros, sombras discretas, cards com profundidade, estados hover, tipografia Manrope/DM Sans, formulários refinados e responsividade aprimorada. O modo escuro também foi ajustado para manter contraste confortável.
