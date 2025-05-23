import postgres from "postgres";
import { onTestFinished } from "vitest";

import { cfg } from "../config";
import { bcryptHasher } from "../features/users/bcrypt-hasher";
import { jwt } from "./http/common";
import { genid } from "./uuid";

const randomPass = () => genid().substring(0, 8);
const randomEmail = () => `${genid()}@example.com`;

export function setupTest() {
  let sql: postgres.Sql;

  async function createUser() {
    const plainTextPass = randomPass();
    const password = await bcryptHasher.hash(plainTextPass);
    const user = {
      id: genid(),
      email: randomEmail(),
      password,
      created_at: new Date(),
      updated_at: new Date(),
    };
    await sql`INSERT INTO users ${sql(user)}`;
    onTestFinished(async () => {
      await sql`DELETE FROM users WHERE id=${user.id}`;
    });
    return {
      id: user.id,
      email: user.email,
      password: plainTextPass,
      token: jwt.sign(user.id),
    };
  }

  async function removeUserByEmail(email: string) {
    await sql`DELETE FROM users WHERE email=${email}`;
  }

  function up() {
    sql = postgres(cfg.databaseUrl, { max: 1 });
  }

  async function down() {
    if (sql) {
      await sql.end();
    }
  }

  type Expense = { description: string; amount: string; date: string };
  async function createExpense(user_id: string, partial?: Partial<Expense>) {
    const id = genid();
    const expense = {
      description: "Groceries",
      amount: "100.0",
      date: "2024-07-23",
      ...partial,
      id,
      created_at: new Date(),
      updated_at: new Date(),
      user_id,
    };
    await sql`INSERT INTO expenses ${sql(expense)}`;
    onTestFinished(async () => {
      await sql`DELETE FROM expenses WHERE id=${id}`;
    });
    return expense;
  }

  return {
    up,
    down,
    createUser,
    randomPass,
    randomEmail,
    createExpense,
    removeUserByEmail,
  };
}
