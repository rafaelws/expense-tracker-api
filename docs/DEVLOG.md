# DEVLOG

A **development log** and task tracker for the project — blending a backlog of upcoming work with a chronological journal of progress and technical decisions.
 
This is **not a changelog**; it documents the project's **internal evolution**.

## Upcoming

- CI/Automation
  - [x] Pre-commit hook with Husky (lint, docs & test)
  - [ ] CI Workflow on `main` (push)
  - [ ] CI script for DB migration

- Infrastructure
  - [x] HTTP setup (Express, Helmet, Compression, CORS, JSON)
  - [x] Logger (`pino`)
  - [x] Configuration (dotenv, Zod)
  - [x] Database (PostgreSQL + Knex, Docker)
  - [x] Testing (unit, integration with Supertest)
  - [x] Linting and ESLint config
  - [x] Production build (Dockerized)
  - [ ] Rate limiter (basic protection for public routes)

- Features
  - [x] Users
    - [x] Create users (with tests)
    - [x] Authenticate users (with tests)
    - [x] Auth middleware (`ensureAuthenticated`, JWT)

  - [x] Expenses
    - [x] CRUD operations
    - [x] Wallet and tag associations (`POST`, `PUT`)
    - [x] FindAll hydration (tags, wallets)
    - [x] Grouping by wallet

  - [x] Tags
    - [x] Create, update, delete (with tests)

  - [x] Wallets
    - [x] Create, update, delete (with tests)
  
  - [ ] Email service (verification, recovery)


---

## Progress Log

### 2025

> _Note_: After a development pause in mid-2024, development resumed in May 2025 with major architectural changes and a shift toward a simpler, more pragmatic direction.

**2025-06-05**
- [Feature] Added `GET /tags` and `GET /wallets` (handlers, tests, docs).
- [Refac] Renamed OpenAPI files to `{domain}-{paths|schemas}.oapi.ts` for clarity.

**2025-06-04**
- [Refac] Refactored OpenAPI for `wallets` and `tags` to use `$ref`.
- [Feature] Added `swagger-ui-express` at `/openapi` for spec preview.

**2025-06-03**
- [Refac] Switched to code-based OpenAPI spec generation using Zod v4 JSON schemas.
- [Refac] Migrated `expenses` to new structure with proper `$ref` usage.
- [Chore] Renamed `TODO.md` to `DEVLOG.md`.

**2025-06-02**
- [Upgrade] Upgraded to **Zod v4**
  - [Refac] Updated schemas and added `meta()` for documentation.
  - [Refac] Updated mappers to use Zod schemas directly.

**2025-05-31**
- [Refac] Completed hydration on `expenses` (`tags`, `wallets`) with grouping by wallet
- [Refac] Replaced `Exposables` with `Public<Entity>` and implemented entity mappers
- [Tests] Added unit tests for mappers (`tags`, `wallets`, `expenses`)

**2025-05-29 – 2025-05-30**
- [Refac] Extended `expenses` to support wallet and tag associations (`POST`, `PUT`) with tests
- [Refac] Started hydration for `expenses` (`tags`, `wallets`, grouping by wallet)

**2025-05-28**
- [Infra] Cleaned up ESLint configuration and refined dependency usage
- [Refac] Switched from extended `Request` typing to `Response.locals` for passing data in middleware
- [DB] Adjusted migrations and updated entity definitions

**2025-05-27**
- [Feature] Tags module: create, update, delete (with tests)

**2025-05-26**
- [Feature] Wallets module (create, update, delete) – no associations yet (with tests)
- [Infra] Improved error handling middleware
- [Tests] Added custom test helpers
- [Tests] Optimized integration tests (reduced unnecessary user creation; balanced isolation)

**2025-05-25**
- [Refac] Completed major refactor of `expenses` module with tests
- [Infra] Replaced `async-wrapper` with `express-async-errors`
- [Refac] Separated HTTP handlers for clarity and added typed request body/query
- [Discussion] Began evaluating cleaner typing for `userId` in authenticated requests

**2025-05-24**
- [Refac] Completed refactor of `users` module with passing e2e tests (`supertest`)
- [Infra] Replaced `winston` with `pino` for HTTP logging
- [Refac] Reviewed and cleaned up middlewares and supporting libs:
  - Validation with `zod`
  - `ensureAuthenticated` middleware
  - Utility libs: JWT, bcrypt, UUID

**2025-05-23**
- [Infra] Setup production Docker environment
- [Infra] Updated build and DB migration scripts
- [Docs] Added documentation to `README` for available `package.json` task scripts

**2025-05-22**
- [Planning] Re-familiarized with the project and codebase
- [Refac] Migrated database layer from Drizzle to Knex (TypeScript)
- [Infra] Initial refactor of database tasks and scripts
- [Infra] Setup local development environment (Docker, Postgres)

### 2024

**2024-07-23**
- [Docs] Added OpenAPI docs for `DELETE /expenses/:id`, `PUT /expenses/:id`, `GET /expenses`
- [Infra] Implemented Expenses HTTP handlers: `PUT`, `DELETE`, `GET`
- [Tests] Updated unit and integration tests
- [Refac] `test-utils`, middlewares

**2024-07-22**
- [Docs] Added OpenAPI docs for `POST /expenses`
- [Refac] Centralized OpenAPI documentation

**2024-07-21**
- [Refac] Integration tests using `test-utils`

**2024-07-19–2024-07-20**
- [Infra] Introduced `big.js` (replaced with `bignumber.js`)
- [Infra] Implemented Expense Repository (Database)
- [Infra] Implemented Expenses HTTP (Routing, `POST`)
- [Tests] Updated unit and integration tests

**2024-07-19**
- [Domain] Implemented `GetExpenses` use case

**2024-07-18**
- [Infra] Added Husky pre-commit Git hook (runs lint, test, docs before commit)

**2024-07-17**
- [Domain] Implemented `Create`, `Update`, `Delete` Expense use cases

**2024-06-28–2024-07-02**
- [Infra] Setup PostgreSQL (Docker) with Drizzle ORM
- [Infra] Added ESLint plugin for Drizzle
- [Infra] Implemented User Repository (Database)
- [Tests] Updated integration tests

**2024-06-27**
- [Docs] Initial Swagger/OpenAPI docs for Setup and Users

**2024-06-25**
- [Infra] Implemented Users HTTP routes
- [Infra] Setup integration testing with `Supertest`
- [Tests] Added integration tests for Users HTTP

**2024-06-24**
- [Infra] HTTP stack setup: Express, Helmet, Compression, CORS, JSON
- [Infra] Added Bcrypt for password hashing
- [Infra] Added JWT utils and middleware
- [Infra] Setup configuration system (`dotenv`, `zod`)
- [Infra] Setup basic logger

**2024-06-23**
- [Tests] Initial test setup
- [Domain] Implemented `CreateUser` use case

**2024-06-22**
- [Setup] Initialized project (TypeScript, ESLint)
- [Domain] Implemented `AuthenticateUser` use case