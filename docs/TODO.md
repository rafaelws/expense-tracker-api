 - [ ] Setup
   - [x] Typescript
   - [x] Linter (add eslint-plugin-drizzle)
   - [x] Testing
   - [ ] local pre-push CI (run lint and tests, husky)
 - [ ] Setup (infra)
   - [ ] HTTP
   - [ ] Database
   - [ ] Logging
   - [ ] repo CI (on main push)
 - [ ] Users
   - [x] domain
     - [x] Authenticate user
     - [x] Create user
   - [ ] infra
     - [x] bcrypt (hash, verify)
     - [X] JWT (encode, decode)
     - [x] JWT HTTP middleware
     - [ ] HTTP

Elapsed:
22/06/2024: setup (ts, linter) + auth user (domain)
23/06/2024: tests setup + create user (domain)

24/06/2024:
 - (infra) http basic setup (express, helmet, compression, cors, json)
 - (infra) bcrypt
 - (infra) jwt
 - (infra) jwt middleware
 - (infra) (setup) configuration (zod, dotenv)
 - (infra) (setup) logger

Ahead:
 - (infra) (setup) integration tests (supertest)
 - (infra) (setup) database (drizzle), postgres on docker
 - (infra) (implementation) database user repo
 - (infra) (implementation) users http (routing)
 - (infra) (implemenatation) users http integration tests
 - (docs) swagger/openapi docs (setup + users)