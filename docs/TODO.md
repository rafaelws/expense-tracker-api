## Backlog:

 - [ ] Setup
   - [x] TypeScript
   - [x] Linter
   - [x] Testing
   - [x] Local pre-commit hook
   - [ ] Repo CI (on main push, GitHub Workflows)
   - [ ] Rate limiter
   - [ ] Production build script
   - [ ] Production script
- [x] Infra
   - [x] HTTP
   - [x] Database
   - [x] Logging
- [x] Users
   - [x] Swagger/OpenAPI docs
   - [x] Domain
     - [x] Authenticate user
     - [x] Create user
     - [ ] (!) Verify e-mail (requires e-mail setup)
     - [ ] (!) Recover password (e-mail verification)
   - [x] Infra
     - [x] Bcrypt (hash, verify)
     - [x] JWT (encode/sign, decode/verify)
     - [x] JWT HTTP middleware
     - [x] HTTP
     - [x] Database
 - [ ] Expenses
   - [ ] Swagger/OpenAPI docs
   - [ ] Domain
     - [x] C
     - [x] D
     - [x] U
     - [ ] R (many)
   - [ ] Infra
     - [ ] Database
     - [ ] HTTP


- - -

## Progress:

2024-07-18:
 - Added Husky pre-commit Git hook (runs linting and tests before commit)

2024-07-17:
 - (Domain) Create, Delete, Update Expense

2024-06-28 - 2024-07-02:
 - (Infra) (Setup) Database
   - PostgreSQL on Docker
   - Drizzle (with ESLint plugin)
 - (Infra) (Implementation) Database User Repository 
 - Updated integration tests

2024-06-27:
 - (Docs) Swagger/OpenAPI Docs (Setup and Users)

2024-06-25:
 - (Infra) (Implementation) Users HTTP (Routing)
 - (Infra) (Setup) Integration Tests (Supertest)
 - (Infra) (Implementation) Users HTTP Integration Tests

2024-06-24:
 - (Infra) HTTP Basic Setup (Express, Helmet, Compression, CORS, JSON)
 - (Infra) Bcrypt
 - (Infra) JWT
 - (Infra) JWT Middleware
 - (Infra) (Setup) Configuration (Zod, dotenv)
 - (Infra) (Setup) Logger

2024-06-23:
 - Tests Setup + Create User (Domain)

2024-06-22:
 - Setup (TS, Linter) + Auth User (Domain)
