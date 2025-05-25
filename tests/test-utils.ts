import { onTestFinished } from "vitest";

import { db } from "@/db/client";
import { ExpenseEntity, toExpenseDb } from "@/features/expenses/expense-entity";
import { jwt } from "@/http/lib/jwt";
import { bcrypt } from "@/lib/bcrypt";
import { uuid } from "@/lib/uuid";

export const randomPass = () => uuid().substring(0, 8);
export const randomEmail = () => `${uuid()}@example.com`;

export async function createUser() {
  const plainText = randomPass();
  const password = await bcrypt.hash(plainText);
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
    token: jwt.sign(user.id),
    password: plainText,
  };
}

export async function removeUserByEmail(email: string) {
  await db("users").delete().where("email", "=", email);
}

export async function createExpense(
  userId: string,
  partial?: Partial<ExpenseEntity>,
) {
  const id = uuid();
  const now = new Date();
  const expense: ExpenseEntity = {
    title: "Groceries",
    amount: "100.0",
    occurredAt: now.toISOString().substring(0, 10),
    status: 1,
    ...partial,
    id,
    createdAt: now,
    updatedAt: now,
    userId,
  };

  await db("expenses").insert(toExpenseDb(expense));
  onTestFinished(async () => {
    await db("expenses").delete().where("id", "=", id);
  });
  return expense;
}
