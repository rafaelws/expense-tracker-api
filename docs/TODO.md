 - [ ] Setup
   - [x] Typescript
   - [x] Linter (add eslint-plugin-drizzle)
   - [x] Testing
   - [ ] local pre-push CI (run lint and tests, husky)
 - [ ] Setup (infra)
   - [x] HTTP
   - [ ] Database
   - [x] Logging
   - [ ] repo CI (on main push, github workflows)
 - [ ] Users
   - [x] swagger/openapi docs
   - [x] domain
     - [x] Authenticate user
     - [x] Create user
   - [ ] infra
     - [x] bcrypt (hash, verify)
     - [X] JWT (encode, decode)
     - [x] JWT HTTP middleware
     - [x] HTTP
     - [ ] database

Elapsed:
22/06/2024: 
 - setup (ts, linter) + auth user (domain)
23/06/2024: 
 - tests setup + create user (domain)
24/06/2024:
 - (infra) http basic setup (express, helmet, compression, cors, json)
 - (infra) bcrypt
 - (infra) jwt
 - (infra) jwt middleware
 - (infra) (setup) configuration (zod, dotenv)
 - (infra) (setup) logger
25/06/2024:
 - (infra) (implementation) users http (routing)
 - (infra) (setup) integration tests (supertest)
 - (infra) (implemenatation) users http integration tests

27/06/2024:
 - (docs) swagger/openapi docs (setup + users)

Ahead:
 - (infra) (setup) database (drizzle), postgres on docker
 - (infra) (implementation) database user repo