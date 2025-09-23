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

1. Adjust values in `.env.docker.dev`.

2. Start the container:
```sh
docker compose --env-file .env.docker.dev -f docker-compose.dev.yml up -d
```

3. Enter the PostgreSQL interactive shell:
```bash
docker exec -it expense_tracker_dev_db psql -U <POSTGRES_USER> -d postgres
```

4. Create the development and test databases:
```sql
CREATE DATABASE <DATABASE_NAME>;
CREATE DATABASE <DATABASE_NAME>_test;
-- \l                      -- list all databases
-- \c <DATABASE_NAME>      -- connect to the database
-- \q                      -- exit shell
```

- - -

### B. Environment Configuration

1. Create environment files:
```sh
cp .env.example .env.local
cp .env.example .env.test.local
```
2. Make sure `.env.local` and `.env.test.local` are aligned with `.env.docker.dev`, particularly the database connection strings (`DATABASE_URL`).

- - -

### C. Scripts

Below is a list of available `npm` scripts for development, testing, linting, documentation, database management, and automation.

#### Development
- `dev`: Runs the application in development mode with hot-reload (`tsx watch src/index.ts`).

#### Linting & Type Checking
- `lint`: Runs all linting and type-checking tasks (`lint:check` + `tscheck`).
- `lint:check`: Runs linting (Biome) against all TypeScript files in the `./src` directory.
- `lint:write`: Attempts to automatically fix any linting issues using Biome.
- `tscheck`: Runs TypeScript compiler checks without emitting files.

#### Tests
- `test`: Executes all tests using Vitest with `NODE_ENV=test`.
- `test:watch`: Watches for file changes and reruns tests — useful during development.
- `test:coverage`: Runs tests with coverage enabled.
- `posttest:coverage`: Serves the coverage report locally via `http-server`.

#### Database (Drizzle)
- `db:generate`: Generates migrations using Drizzle Kit.
- `db:migrate`: Runs pending migrations.
- `db:studio`: Opens Drizzle Studio on port `35353` with verbose output.

#### Build
- `build`: Compiles the application using `tsup`.

#### Automation (not intended for manual execution)
- `prepare`: Runs Husky setup automatically after `npm install` to enable Git hooks.
- `husky:pre-commit`: Git pre-commit hook that runs linting, documentation checks, and tests.
- `pkg:update`: Updates project dependencies interactively using `npm-check-updates`.