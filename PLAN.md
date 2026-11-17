# ERP Autopeças - Backend: Planejamento (passo a passo por commits)

> Siga as fases em ordem. Cada passo é **um commit** (Conventional Commits) e termina com um critério de "Pronto quando", para você só avançar com o anterior funcionando.
> Detalhes da stack, estrutura e regras estão em `AGENTS.md`.

## Como usar este documento

- Marque `[x]` ao concluir cada commit
- Antes de cada commit: `npm run lint`, `npm run typecheck` e `npm test`
- Se um passo ficar grande demais, quebre em dois commits
- Os passos das Fases 0 a 2 são a fundação; da Fase 4 em diante cada fase é um módulo de negócio
- Dica: ao terminar a Fase 3, o front-end já consegue começar o login (veja `frontend/spec.md`)

---

## Fase 0 - Setup do projeto

### Commit 1: inicializar o projeto

`chore: inicializa projeto node com typescript`

- [x] Criar a pasta `backend/` e rodar `npm init -y`
- [x] Instalar `typescript`, `tsx` e `@types/node` (dev)
- [x] Criar `tsconfig.json` simples, com `strict` ligado
- [x] Criar `.gitignore` (`node_modules`, `.env`, `dist`, `coverage`)
- [x] Criar os scripts `start`, `dev` e `clean` no `package.json`

**Pronto quando:** `npm run dev` roda um `src/server.ts` vazio sem erro.

### Commit 2: servidor Express básico

`feat: adiciona servidor express com rotas base`

- [x] Instalar `express` e `@types/express`
- [x] Criar `src/app.ts` (cria e configura o app, com `express.json()`)
- [x] Criar `src/server.ts` (sobe o servidor)
- [x] Criar `src/routes/index.routes.ts` com `/api` (status, nome do projeto e timestamp) e `/api/hello`

**Pronto quando:** `GET http://localhost:3333/api` retorna JSON com status e timestamp.

### Commit 3: variáveis de ambiente validadas

`feat: valida variaveis de ambiente com zod`

- [x] Instalar `zod` e `dotenv`
- [x] Criar `.env` e `.env.example` com `PORT=3333` e `NODE_ENV`
- [x] Criar `src/config/env.ts` que valida o `process.env` e encerra o boot se faltar algo
- [x] Usar `env.PORT` no `server.ts`

**Pronto quando:** remover `PORT` do `.env` faz a aplicação falhar com uma mensagem clara.

### Commit 4: Biome

`chore: configura biome para lint e formatacao`

- [ ] Instalar `@biomejs/biome` e rodar `npx biome init`
- [ ] Criar os scripts `lint` e `format`
- [ ] Rodar `npm run format` e corrigir o que o lint apontar

**Pronto quando:** `npm run lint` passa sem erros.

### Commit 5: testes com Vitest e Supertest

`test: configura vitest e supertest com primeiro teste`

- [ ] Instalar `vitest` e `supertest` (+ `@types/supertest`)
- [ ] Criar `vitest.config.ts`
- [ ] Criar os scripts `test`, `test:watch` e `typecheck`
- [ ] Criar `tests/api.test.ts` testando `GET /api` e `GET /api/hello`

**Pronto quando:** `npm test` passa.

### Commit 6: hooks de commit

`chore: adiciona husky e lint-staged`

- [ ] Instalar `husky` e `lint-staged`
- [ ] Configurar o pre-commit para rodar o Biome nos arquivos alterados e o `typecheck`

**Pronto quando:** um commit com erro de lint é bloqueado.

### Commit 7: CI

`ci: adiciona workflow do github actions`

- [ ] Criar `.github/workflows/ci.yml` (no repositório, ajustando `working-directory` para `backend/`)
- [ ] Etapas: `actions/checkout`, `actions/setup-node` (com cache do npm), `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`
- [ ] Rodar em `push` e `pull_request`

**Pronto quando:** o workflow fica verde no GitHub.

---

## Fase 1 - Fundação da API

### Commit 8: tratamento de erros

`feat: adiciona tratamento global de erros`

- [ ] Criar `src/shared/errors/app-error.ts` (mensagem, status HTTP e código)
- [ ] Criar `src/middlewares/not-found.ts` e `src/middlewares/error-handler.ts`
- [ ] Padronizar a resposta de erro em JSON (`{ error: { code, message, details? } }`)
- [ ] Tratar erros do Zod e do Prisma (violação de unicidade, registro não encontrado) no handler
- [ ] Testes: rota inexistente retorna 404 em JSON

**Pronto quando:** qualquer erro, esperado ou não, sai no mesmo formato JSON e sem vazar stack trace em produção.

### Commit 9: middleware de validação

`feat: adiciona middleware de validacao com zod`

- [ ] Criar `src/middlewares/validate.ts`, que recebe schemas Zod para `body`, `query` e `params`
- [ ] Testes: entrada inválida retorna 400 com os detalhes dos campos

**Pronto quando:** uma rota de exemplo rejeita entrada inválida de forma padronizada.

### Commit 10: segurança e logs

`feat: adiciona helmet, cors, rate limit e logs`

- [ ] Instalar e configurar `helmet`, `cors` (origem vinda do `CORS_ORIGIN`) e `express-rate-limit`
- [ ] Instalar `pino` e `pino-http`, criando `src/lib/logger.ts`
- [ ] Adicionar `CORS_ORIGIN` ao `.env`, ao `.env.example` e ao schema do `env.ts`

**Pronto quando:** as requisições aparecem nos logs e o CORS bloqueia origens não autorizadas.

---

## Fase 2 - Banco de dados

### Commit 11: Prisma e conexão com o Supabase

`chore: configura prisma 6 e conexao com supabase`

- [ ] Criar o projeto no Supabase (usar só como banco)
- [ ] Instalar `prisma` e `@prisma/client` na versão 6
- [ ] Rodar `npx prisma init` e configurar `DATABASE_URL` (pooler) e `DIRECT_URL` (conexão direta) no `datasource`
- [ ] Criar `src/lib/prisma.ts` (instância única do client)
- [ ] Criar os scripts `db:generate`, `db:migrate`, `db:deploy` e `db:seed`
- [ ] Seguir o guia do Supabase para Prisma, para evitar erro de conexão

**Pronto quando:** o Prisma consegue conectar e rodar uma migration vazia.

### Commit 12: PostgreSQL local com Docker

`chore: adiciona docker-compose com postgres local`

- [ ] Criar `docker-compose.yml` na raiz do repositório com um Postgres para desenvolvimento e outro (ou outro database) para testes
- [ ] Documentar no `.env.example` as URLs locais
- [ ] Configurar o Vitest para usar o banco de teste

**Pronto quando:** `docker compose up -d` sobe o banco e as migrations rodam nele.

### Commit 13: health check com banco

`feat: adiciona endpoint de health com verificacao do banco`

- [ ] Criar `GET /api/health` que executa `SELECT 1` via Prisma
- [ ] Teste de integração para o endpoint

**Pronto quando:** o endpoint retorna `200` com o banco no ar e `503` com o banco fora. (Esse endpoint será chamado pelo pinger no deploy.)

---

## Fase 3 - Autenticação e usuários

### Commit 14: modelo de usuário

`feat: adiciona modelo de usuario e perfis`

- [ ] Criar no `schema.prisma` o enum `Role` (`ADMIN`, `MANAGER`, `SELLER`, `FINANCE`) e o modelo `User` (nome, e-mail único, hash da senha, perfil, ativo, datas)
- [ ] Rodar a migration
- [ ] Criar o seed com um usuário `ADMIN` inicial (senha vinda do `.env`)

**Pronto quando:** `npm run db:seed` cria o administrador.

### Commit 15: login

`feat: adiciona login com jwt`

- [ ] Instalar `argon2` e `jsonwebtoken`
- [ ] Criar o módulo `auth` com `POST /api/auth/login`
- [ ] Gerar access token (curto) e refresh token (longo)
- [ ] Aplicar rate limit mais rígido no login
- [ ] Testes: login válido, senha errada, usuário inativo

**Pronto quando:** o login retorna os tokens e nunca devolve o hash da senha.

### Commit 16: proteção de rotas e perfis

`feat: adiciona middlewares de autenticacao e autorizacao`

- [ ] Criar `authenticate` (valida o JWT e injeta o usuário na requisição)
- [ ] Criar `authorize(...roles)` (checa o perfil)
- [ ] Criar `POST /api/auth/refresh` e `GET /api/auth/me`
- [ ] Testes: sem token retorna 401; perfil sem permissão retorna 403

**Pronto quando:** uma rota de exemplo só responde para o perfil permitido.

### Commit 17: gestão de usuários

`feat: adiciona crud de usuarios`

- [ ] Módulo `users`: listar (paginado), criar, editar, desativar
- [ ] Apenas `ADMIN` acessa
- [ ] Testes de integração

**Pronto quando:** o admin cria um vendedor, que consegue logar.

---

## Fase 4 - Cadastros

### Commit 18: categorias

`feat: adiciona crud de categorias`

- [ ] Modelo `Category` e módulo `categories`
- [ ] Testes de integração

### Commit 19: produtos

`feat: adiciona crud de produtos com atributos dinamicos`

- [ ] Modelo `Product`: `sku` único, nome, marca, código do fabricante, NCM, preço (`Decimal`), custo (`Decimal`), estoque mínimo, `categoryId` e `attributes` (`Json`)
- [ ] Criar o índice GIN em `attributes` (via `@@index(..., type: Gin)` ou migration SQL)
- [ ] CRUD com paginação, busca por nome/SKU e filtro por categoria
- [ ] Filtro dentro do JSON de atributos (usar `$queryRaw` se necessário)
- [ ] Testes de integração

**Pronto quando:** produtos de categorias diferentes aceitam atributos diferentes e dá para filtrar por eles.

### Commit 20: veículos e compatibilidade

`feat: adiciona veiculos e compatibilidade com produtos`

- [ ] Modelos `Vehicle` (marca, modelo, ano inicial/final, motor) e a relação muitos-para-muitos com `Product`
- [ ] Endpoints para cadastrar veículos e vincular/desvincular produtos
- [ ] Busca "peças compatíveis com este veículo" e "veículos compatíveis com esta peça"
- [ ] Testes de integração

**Pronto quando:** dado um veículo, a API lista as peças que servem nele.

### Commit 21: equivalência de peças

`feat: adiciona equivalencias entre produtos`

- [ ] Relação de equivalência entre produtos (códigos de fabricante diferentes para a mesma aplicação)
- [ ] Endpoint que lista equivalentes de um produto

**Pronto quando:** ao consultar uma peça, a API sugere as equivalentes. (Opcional: pode ficar para depois do MVP.)

### Commit 22: clientes

`feat: adiciona crud de clientes`

- [ ] Modelo `Customer` (nome, CPF/CNPJ único e validado, contato, endereço)
- [ ] CRUD com paginação e busca
- [ ] Testes de integração

### Commit 23: fornecedores

`feat: adiciona crud de fornecedores`

- [ ] Modelo `Supplier` e módulo `suppliers`, no mesmo padrão dos clientes
- [ ] Testes de integração

---

## Fase 5 - Estoque

### Commit 24: movimentações de estoque

`feat: adiciona movimentacoes de estoque`

- [ ] Modelo `StockMovement` (produto, tipo `IN`/`OUT`/`ADJUSTMENT`, quantidade, motivo, usuário, data)
- [ ] Service de estoque com entrada manual e ajuste
- [ ] Atualizar o saldo do produto **na mesma transação** que cria a movimentação
- [ ] Impedir saldo negativo
- [ ] Testes de integração

**Pronto quando:** toda alteração de saldo deixa um registro de movimentação.

### Commit 25: concorrência no estoque

`feat: protege baixa de estoque contra concorrencia`

- [ ] Implementar o decremento atômico com condição (`stock >= quantidade`) ou `SELECT ... FOR UPDATE`
- [ ] Teste de integração: duas baixas simultâneas da última peça, e só uma pode ter sucesso

**Pronto quando:** o teste de concorrência passa de forma consistente.

### Commit 26: consultas e alertas de estoque

`feat: adiciona consulta de posicao e alerta de estoque minimo`

- [ ] `GET /api/stock` (posição atual com filtros)
- [ ] `GET /api/stock/low` (produtos abaixo do estoque mínimo)
- [ ] `GET /api/stock/movements` (histórico paginado)

---

## Fase 6 - Compras (entrada de mercadoria)

### Commit 27: pedidos de compra

`feat: adiciona compras de fornecedores com entrada em estoque`

- [ ] Modelos `Purchase` e `PurchaseItem` (fornecedor, itens, custo unitário `Decimal`, total)
- [ ] Ao confirmar a compra, gerar a movimentação de entrada de estoque via service do módulo `stock`, tudo em uma transação
- [ ] Testes de integração

> Se quiser reduzir o escopo do MVP, esta fase pode ser feita depois de vendas, usando apenas entrada manual de estoque (Commit 24).

---

## Fase 7 - Vendas

### Commit 28: modelo de vendas

`feat: adiciona modelos de venda e itens`

- [ ] Modelos `Sale` (cliente, vendedor, status, forma de pagamento, desconto, total) e `SaleItem` (produto, quantidade, preço unitário **congelado no momento da venda**)
- [ ] Rodar a migration

### Commit 29: criar venda

`feat: adiciona criacao de venda com baixa de estoque`

- [ ] `POST /api/sales`, que dentro de **uma única transação**: valida os itens, baixa o estoque (service de `stock`), cria a venda e os itens, e calcula o total no servidor
- [ ] Nunca confiar no preço ou no total enviados pelo cliente
- [ ] Se faltar estoque em qualquer item, nada é gravado
- [ ] Testes: venda com sucesso, estoque insuficiente (rollback completo), desconto

**Pronto quando:** uma venda falha por inteiro se qualquer item falhar.

### Commit 30: cancelamento e consultas

`feat: adiciona cancelamento e consulta de vendas`

- [ ] `POST /api/sales/:id/cancel`, que devolve o estoque e cancela os lançamentos financeiros, na mesma transação
- [ ] `GET /api/sales` (paginado, filtros por período, vendedor, cliente e status) e `GET /api/sales/:id`
- [ ] `SELLER` vê apenas as próprias vendas; `MANAGER` e `ADMIN` veem todas
- [ ] Testes de integração

---

## Fase 8 - Financeiro

### Commit 31: contas a receber e a pagar

`feat: adiciona contas a receber e a pagar`

- [ ] Modelo `FinancialEntry` (tipo `RECEIVABLE`/`PAYABLE`, valor `Decimal`, vencimento, status, origem: venda ou compra)
- [ ] Criar o lançamento a receber automaticamente ao confirmar uma venda (na mesma transação)
- [ ] Criar o lançamento a pagar ao confirmar uma compra
- [ ] Endpoints para listar, baixar (marcar como pago) e lançar manualmente
- [ ] Acesso para `FINANCE`, `MANAGER` e `ADMIN`
- [ ] Testes de integração

**Pronto quando:** vender gera estoque baixado e conta a receber de forma consistente.

---

## Fase 9 - Relatórios

### Commit 32: relatórios de vendas

`feat: adiciona relatorios de vendas`

- [ ] Faturamento por período
- [ ] Faturamento por categoria e por vendedor (usar `$queryRaw` com SQL, se ficar mais claro)
- [ ] Produtos mais vendidos

### Commit 33: curva ABC e dashboard

`feat: adiciona curva abc e indicadores do dashboard`

- [ ] Curva ABC de estoque/vendas
- [ ] `GET /api/reports/dashboard` com os indicadores principais (vendas do dia/mês, contas a vencer, produtos com estoque baixo)
- [ ] Testes com dados do seed

---

## Fase 10 - Qualidade e entrega

### Commit 34: seed completo

`feat: amplia seed com dados de exemplo`

- [ ] Popular categorias, produtos (com atributos variados), veículos, compatibilidades, clientes, fornecedores, algumas vendas e lançamentos
- [ ] Garantir que o seed pode ser rodado de novo (idempotente) ou que limpa antes de popular

**Pronto quando:** um banco vazio fica pronto para demonstração com um único comando. Esse também é o plano B se o Supabase pausar ou o banco for perdido.

### Commit 35: documentação da API

`docs: adiciona swagger com documentacao da api`

- [ ] Instalar `swagger-ui-express`
- [ ] Gerar o OpenAPI a partir dos schemas Zod (ou escrever o JSON manualmente)
- [ ] Expor em `/api/docs`

### Commit 36: logs de auditoria

`feat: registra auditoria das alteracoes principais`

- [ ] Registrar quem alterou o quê nas entidades principais (produto, preço, venda, estoque)
- [ ] (Opcional) Endpoint para consultar o histórico, acessível por `ADMIN`

### Commit 37: CI completa com banco

`ci: roda testes de integracao com postgres no github actions`

- [ ] Adicionar um `services: postgres` no workflow
- [ ] Rodar as migrations (`npm run db:deploy`) antes dos testes
- [ ] Garantir que o CI passa do zero, sem depender de nada local

---

## Fase 11 - Deploy

### Commit 38: preparar para produção

`chore: prepara aplicacao para deploy`

- [ ] Garantir `start` funcionando em produção, lendo a `PORT` do ambiente
- [ ] Rodar `npm run db:deploy` no passo de build ou de release
- [ ] Confirmar que nenhuma variável sensível está no repositório
- [ ] Rever as origens do CORS para a URL do front-end na Vercel

### Commit 39: deploy no Render

`docs: documenta deploy no render`

- [ ] Criar o Web Service no Render apontando para a pasta `backend/`
- [ ] Configurar as variáveis de ambiente (`DATABASE_URL`, `DIRECT_URL`, `JWT_*`, `CORS_ORIGIN`...)
- [ ] Configurar o pinger (ex.: cron-job.org) chamando `/api/health` a cada poucos minutos, para evitar o sleep do Render e a pausa do Supabase
- [ ] Anotar no README que a primeira requisição pode demorar (cold start do plano gratuito)
- [ ] Confirmar nos sites oficiais os limites atuais dos planos gratuitos

**Pronto quando:** a API responde em uma URL pública e o front-end consegue consumi-la.

### Commit 40: README

`docs: escreve readme do backend`

- [ ] O que é o projeto e quais módulos existem
- [ ] Decisões técnicas e justificativas (monólito modular, só PostgreSQL com JSONB, transações, Supabase só como banco)
- [ ] Como rodar localmente (Docker, `.env`, migrations, seed)
- [ ] Link da documentação Swagger e do deploy

---

## Backlog (depois do MVP)

- Emissão fiscal (NF-e), possivelmente via integração com serviço externo
- Importação de produtos por planilha (CSV/XLSX)
- Orçamentos e ordens de serviço
- Sentry para monitoramento de erros
- Extrair o módulo de estoque como serviço separado (exercício de microsserviços)
