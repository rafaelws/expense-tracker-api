# Expense Tracker (api)

(WIP) Expense Tracker backend.

## Features
 - [x] Authentication (JWT)
 - [ ] Expenses
   - [ ] Groups
   - [ ] Tags
 - [ ] Add support for:
   - [ ] Recurring expenses
   - [ ] Installments
 - [ ] Charts and reports

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
- `test:integration`: Executes tests located in the `./src/infra` folder. These tests require database setup and will run `db:migrate:lastest` before starting.
- `test`: Runs `test:integration`.
- `test:coverage`: Executes all tests and provides coverage results.
- `test:watch`: Executes all tests and waits for modifications, useful during development.

#### Linting
- `lint`: Executes eslint for all TypeScript files inside the `./src` directory.
- `lint:fix`: Executes `lint` and attempts to fix errors automatically.

#### Documentation
- `docs:lint`: Verifies the validity of the OpenAPI/Swagger file (`./docs/spec.yml`).

#### Automation (do not run manually)
 - `prepare`: Automatically runs `husky` after `npm install` to set up Git hooks.
 - `husky:pre-commit`: Runs the pre-commit Git hook automatically (linting and tests).

#### Database
- TODO