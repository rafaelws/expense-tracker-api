# Expense Tracker (API)

> ⚙️ Backend API for a personal expense tracking system.  
> **Status**: Work in Progress (WIP)

## Features

### v1 (MVP)
- User authentication (JWT-based)
- Expense, wallet, and tag management
- CSV import

### v2 (Planned)
- Recurring expenses
- Installment handling

## License

This project is licensed under the [MIT License](LICENSE).

- - -

## Setting up a development environment

### A. Database Setup (PostgreSQL via Docker)

> 💡 This guide assumes you're using Docker for PostgreSQL. If you prefer installing PostgreSQL locally, adjust accordingly.

1. Adjust values in `dev.docker.env`.

2. Start the container:
```sh
docker compose --env-file dev.docker.env -f dev.docker-compose.yml up -d
```

3. Enter the PostgreSQL interactive shell:
```bash
docker exec -it expense_tracker_dev_db psql -U <username> -d postgres
```

4. Create the development and test databases:
```sql
CREATE DATABASE <database_name>;
CREATE DATABASE <database_name_test>;
-- \l                      -- list all databases
-- \c <database_name>      -- connect to the database
-- \q                      -- exit shell
```

- - -

### B. Environment Configuration

1. Create environment files:
```sh
cp .env.example .env.local
cp .env.example .env.test.local
```
2. Make sure `.env.local` and `.env.test.local` are aligned with `dev.docker.env`, particularly the database connection strings (`DATABASE_URL`).

- - -

### C. Scripts

Below is a list of available `npm` scripts for development, testing, linting, and database management.

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

#### Database (Knex)
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

#### Automation (not intended for manual execution)
- `prepare`: Automatically runs `husky` setup after `npm install` to enable Git hooks.
- `husky:pre-commit`: Git pre-commit hook that runs linting, documentation checks, and tests.