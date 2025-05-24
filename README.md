# Expense Tracker (api)

(WIP) Expense Tracker backend.

## Features
 - v1:
  - [ ] Users + Authentication (JWT)
  - [ ] Expenses
  - [ ] Wallets
  - [ ] Tags
  - [ ] CSV import
 - v2:
  - [ ] Recurring expenses
  - [ ] Installments

## License

[MIT](LICENSE)

- - -

## Setting up a development environment

### A. Configuration (3 steps)

1. Create two local files at the project root named `.env.local` and `.env.test.local`.
2. Copy the contents from `.env.example` into each respective file.
3. Modify the values in each file accordingly.

- - -

### B. Database (PostgreSQL) (8 steps)

1. Create a volume to store persistent data:
```bash
docker volume create volume_name
```

2. Create a docker container for the database:
```bash
docker run \
  --name container_name \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -v volume_name:/var/lib/postgresql/data \
  -p 5432:5432 \
  --restart unless-stopped \
  -d postgres:latest
```

3. Enter PostgreSQL shell:
```bash
docker exec -it container_name psql -U username -d postgres
```

4. Create the databases (development and test):
```sql
CREATE DATABASE database_name;
CREATE DATABASE database_name_test;
```

5. Verify if databases were created:
```bash
\l
```

6. Exit the PostgreSQL shell:
```bash
\q
```

7. Update your `.env.local` file:
```plaintext
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

8. Update your `.env.test.local` file:
```plaintext
DATABASE_URL="postgresql://username:password@localhost:5432/database_name_test"
```

#### Notes:

- **Volume Creation:** Replace `volume_name` with your desired volume name.
- **Container Creation:** Replace `container_name`, `username`, `password`, and `volume_name` with appropriate values for your environment.
  - **Restart Policy:**
    - `--restart unless-stopped` ensures the container will automatically restart if it stops or if the Docker daemon is restarted, except if the container was manually stopped.
- **Database Creation:** Replace `database_name` and `database_name_test` with appropriate names.
- **PostgreSQL Shell Commands:**
  - `\l` lists all databases.
  - `\q` exits the PostgreSQL shell.
  - `\c database_name` connects to the database. 

- - -

### C. Scripts

#### Tests
- `test:integration`: Executes integration tests located in `./src/infra`. Requires database setup and runs `db:migrate:latest` beforehand.
- `test`: Alias for `test:integration`.
- `test:coverage`: Runs all tests and generates a coverage report.
- `test:watch`: Watches for file changes and reruns all tests — useful during development.

#### Linting
- `lint`: Runs ESLint against all TypeScript files inside the `./src` directory.
- `lint:fix`: Attempts to automatically fix any linting issues.

#### Documentation
- `docs:lint`: Validates the OpenAPI/Swagger file located at `./docs/spec.yml`.
- `docs:bundle`: Bundles the OpenAPI specification from `index.yml` into a single `openapi.yml` file.
- `docs:include`: Adds the generated `openapi.yml` to Git.
- `docs`: Runs `docs:lint`, `docs:bundle`, and `docs:include` in sequence.

#### Database
- `knex`: Access to the Knex CLI with support for TypeScript, dotenv, and custom config (`./src/db/config.ts`).
- `db:migrate:make`: Creates a new migration file.
- `db:migrate:latest`: Runs all pending migrations in the development environment.
- `db:migrate:rollback`: Rolls back the last executed migration.
- `db:migrate:up`: Runs a specific migration.
- `db:migrate:down`: Rolls back a specific migration.
- `db:migrate:list`: Lists the status of all migrations.
- `db:migrate:production`: Runs latest migrations in production using the transpiled config (`dist/db/config.js`).

#### Build
- `build:migrations`: Transpiles migration files using `tsc` with `tsconfig.migrations.json`.
- `build:app`: Compiles the application using `tsup` with ESM output, minification, and type definitions.
- `build`: Runs all build tasks in parallel (`build:*`).

#### Automation (do not run manually)
- `prepare`: Automatically runs `husky` setup after `npm install` to enable Git hooks.
- `husky:pre-commit`: Git pre-commit hook that runs linting, documentation checks, and tests.