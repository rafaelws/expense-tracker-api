## Backlog:

 - [ ] Setup
   - [x] TypeScript
   - [x] Linter
   - [x] Testing
   - [x] Local pre-commit hook (Husky)
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
 - [x] Expenses
   - [x] Swagger/OpenAPI docs
   - [X] Domain
     - [x] C
     - [x] D
     - [x] U
     - [x] R (many)
   - [x] Infra
     - [x] Database
     - [x] HTTP
       - [x] POST /expenses
         - [x] docs
       - [x] DELETE /expenses/:id
         - [x] docs
       - [x] PUT /expenses/:id
         - [x] docs
       - [x] GET /expenses?ref=date&period=15d
         - [x] docs


- - -

## Progress:

2024-07-23:
 - Added documentation for DELETE /expenses/:id, PUT /expenses/:id and GET /expenses
 - (Infra) (Implementation) Expenses HTTP (PUT, DELETE, GET)
 - Updated unit and integration tests
 - refac: test-utils, middlewares

2024-07-22:
 - Refactored OpenAPI documentation
 - Added documentation for POST /expenses

2024-07-21:
 - Refactored integration tests using test-utils

2024-07-19 - 2024-07-20:
 - (Infra) added big.js
 - (Infra) (Implementation) Database Expense Repository
 - (Infra) (Implementation) Expenses HTTP (Routing; POST)
 - Replaced big.js with bignumber.js
 - Updated unit and integration tests

2024-07-19:
 - (Domain) Get Expenses

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
