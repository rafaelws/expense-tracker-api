import { onTestFinished } from "vitest";

import { db } from "@/db/client";
import { jwt } from "@/http/lib/jwt";
import { bcrypt } from "@/lib/bcrypt";
import { uuid } from "@/lib/uuid";

export const randomPass = () => uuid().substring(0, 8);
export const randomEmail = () => `${uuid()}@example.com`;

export async function createUser() {
  const plainTextPass = randomPass();
  const password = await bcrypt.hash(plainTextPass);
  const user = {
    id: uuid(),
    email: randomEmail(),
    password,
    created_at: new Date(),
    updated_at: new Date(),
  };

  await db("users").insert(user);

  onTestFinished(async () => {
    await db("users").delete().where("id", "=", user.id);
  });

  return {
    id: user.id,
    email: user.email,
    password: plainTextPass,
    token: jwt.sign(user.id),
  };
}

export async function removeUserByEmail(email: string) {
  await db("users").delete().where("email", "=", email);
}

// async function up() {}
// async function down() {}

// type Expense = { description: string; amount: string; date: string };
// async function createExpense(user_id: string, partial?: Partial<Expense>) {
//   const id = uuid();
//   const expense = {
//     description: "Groceries",
//     amount: "100.0",
//     date: "2024-07-23",
//     ...partial,
//     id,
//     created_at: new Date(),
//     updated_at: new Date(),
//     user_id,
//   };
//   await sql`INSERT INTO expenses ${sql(expense)}`;
//   onTestFinished(async () => {
//     await sql`DELETE FROM expenses WHERE id=${id}`;
//   });
//   return expense;
// }
