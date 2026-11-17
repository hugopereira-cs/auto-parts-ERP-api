# ERP Autopeças - Backend

# Context

API REST de um sistema estilo ERP para uma loja de autopeças (projeto pessoal de portfólio).
Arquitetura de **monólito modular**: um único backend com módulos de negócio bem separados (`products`, `stock`, `sales`, `finance`...), pensados para poderem virar serviços no futuro.

Módulos do MVP: autenticação e perfis, categorias, produtos (com compatibilidade por veículo), clientes, fornecedores, estoque, vendas, financeiro e relatórios.

## Structure

```
backend/
  prisma/
    schema.prisma
    seed.ts
    migrations/
  src/
    config/
      env.ts
    lib/
      prisma.ts
      logger.ts
    middlewares/
      authenticate.ts
      authorize.ts
      validate.ts
      error-handler.ts
      not-found.ts
    shared/
      errors/
        app-error.ts
    modules/
      auth/
        auth.routes.ts
        auth.controller.ts
        auth.service.ts
        auth.schema.ts
      users/
      categories/
      products/
      vehicles/
      customers/
      suppliers/
      stock/
      sales/
      finance/
      reports/
    routes/
      index.routes.ts
    app.ts
    server.ts
  tests/
  .env
  .env.example
  .gitignore
  biome.json
  package.json
  tsconfig.json
  vitest.config.ts
```

> Cada módulo segue o padrão `<modulo>.routes.ts`, `<modulo>.controller.ts`, `<modulo>.service.ts` e `<modulo>.schema.ts` (Zod). Crie apenas os arquivos de que o módulo realmente precisa.

## Tech Stack

- **node.js** (LTS atual) - runtime
- **npm** - gerenciador de pacotes
- **typescript** - linguagem
- **express** (versão estável atual) - framework HTTP
- **postgresql** (Supabase, usado somente como banco) - banco de dados
- **prisma 6** - ORM e migrations
- **biome** - linter e formatter
- **vitest** - testes
- **github actions** - CI/CD
- **render** - deploy da API

## Packages

### Dependencies

- **express** - Fast, unopinionated, minimalist web framework for Node.js
- **zod** - validação de body, query, params e variáveis de ambiente
- **@prisma/client** - cliente do Prisma (versão 6)
- **jsonwebtoken** - geração e validação de JWT
- **argon2** - hash de senhas
- **helmet** - cabeçalhos HTTP seguros
- **cors** - controle de CORS
- **express-rate-limit** - limite de requisições (principalmente no login)
- **pino** e **pino-http** - logs estruturados
- **dotenv** - carregar variáveis de ambiente

### Dev Dependencies

- **tsx** - TypeScript Execute (tsx): The easiest way to run TypeScript in Node.js
- **typescript** e **@types/\*** - tipos
- **prisma** - CLI do Prisma (versão 6)
- **vitest** - runner de testes
- **supertest** - testes de rotas HTTP
- **@biomejs/biome** - lint e formatação
- **husky** e **lint-staged** - validações antes do commit

### Adicionar depois do MVP

- **swagger-ui-express** (+ geração OpenAPI a partir dos schemas Zod) - documentação da API
- **@sentry/node** - monitoramento de erros

## Scripts Default

> Criar no arquivo `package.json`

- `start` - iniciar o servidor com tsx
- `dev` - iniciar em modo de desenvolvimento com watch
- `test` - executa testes com Vitest (`vitest run`)
- `test:watch` - executa testes em modo watch
- `typecheck` - roda `tsc --noEmit`
- `lint` - roda `biome ci .`
- `format` - formata o código com o Biome
- `clean` - remover arquivos temporários ou artefatos simples do projeto
- `db:generate` - gera o Prisma Client
- `db:migrate` - cria e aplica migrations em desenvolvimento
- `db:deploy` - aplica migrations em produção (`prisma migrate deploy`)
- `db:seed` - popula o banco com dados de exemplo

## Environment Variables

> Definir em `.env` (nunca versionar) e documentar em `.env.example` (sem valores sensíveis). Validar tudo com Zod em `src/config/env.ts`; a aplicação deve falhar ao iniciar se faltar alguma variável.

- `PORT` - porta do servidor (**3333**)
- `NODE_ENV` - `development`, `test` ou `production`
- `DATABASE_URL` - conexão via pooler do Supabase (usada pela aplicação)
- `DIRECT_URL` - conexão direta (usada pelas migrations)
- `JWT_SECRET` - segredo do access token
- `JWT_EXPIRES_IN` - validade do access token
- `JWT_REFRESH_SECRET` - segredo do refresh token
- `CORS_ORIGIN` - origem permitida (URL do front-end)

## Endpoints Sample

- `/api` - retornar o status da api, nome do projeto e timestamp
- `/api/hello` - retorna um hello world simples em um json
- `/api/health` - verifica a API e executa uma query simples no banco (usado pelo pinger para evitar sleep do Render e pausa do Supabase)

## Domain Rules

- **Dinheiro**: sempre `Decimal` no Prisma, nunca `Float`
- **Produtos**: campos comuns em colunas normais (`sku`, `name`, `price`, `stock`, `categoryId`...); atributos variáveis por categoria em uma coluna `attributes` do tipo `Json` (JSONB) com índice GIN
- **Compatibilidade**: relação muitos-para-muitos entre produtos e veículos (marca, modelo, ano, motor)
- **Venda**: criar venda + itens + baixa de estoque + lançamento financeiro em **uma única transação** (`prisma.$transaction`)
- **Estoque**: decremento atômico com condição (`stock >= quantidade`) ou `SELECT ... FOR UPDATE` via `$queryRaw`; nunca ler e depois escrever sem proteção de concorrência
- **Movimentação de estoque**: toda alteração de estoque gera um registro de movimentação (entrada, saída, ajuste), com usuário e motivo
- **Módulos**: um módulo não acessa as tabelas de outro diretamente; deve chamar o service do outro módulo
- **Perfis**: `ADMIN`, `MANAGER`, `SELLER` e `FINANCE`, com permissões verificadas no middleware `authorize`
- **Auditoria**: registrar quem criou/alterou os dados principais (`createdBy`, `updatedBy`, `createdAt`, `updatedAt`)

## Code Guideline

- Constantes sempre em caixa alta, e no padrão `SCREAMING_SNAKE_CASE`
- Nomes de arquivos utilizar padrão `kebab-case`
- Estrutura simples e organizada
- Separar app, server e rotas
- Camadas: `routes` define caminhos, `controller` lida com HTTP, `service` contém a regra de negócio
- Validar toda entrada (body, query, params) com Zod no middleware `validate`
- Erros de negócio lançados como `AppError` (com status e código) e tratados em um único `error-handler`
- Evite complexidade desnecessária
- Preferir configurações simples de TypeScript (`strict` ligado)
- Usar `$queryRaw` apenas quando o Prisma não atender bem (relatórios pesados, filtros em JSONB, locks)
- Commits no padrão Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, `ci:`)

## Guardrails

- Sempre use apenas **npm**
- Sempre crie novos arquivos **typescript**
- Sempre utilizar tsx para executar arquivos .ts
- Sempre que possível responda os endpoints no formato `JSON`
- Nunca deixe senhas, configurações e dados sensíveis em hard code, deixe em um arquivo .env
- Usar a porta 3333 no arquivo `.env` como entrypoint do meu servidor
- Usar o Supabase **somente como banco PostgreSQL**; autenticação e regras de negócio ficam na API (não usar Supabase Auth, Storage ou Realtime)
- Nunca retornar hash de senha ou qualquer dado sensível nas respostas
- Nunca fazer mock do banco nos testes de integração; usar um PostgreSQL real (Docker local ou service container no CI)
- Toda alteração de schema passa por migration versionada do Prisma
- Rodar `npm run lint`, `npm run typecheck` e `npm test` antes de finalizar uma tarefa
