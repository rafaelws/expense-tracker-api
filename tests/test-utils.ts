import { onTestFinished } from "vitest";

import { db } from "@/db/client";
import { ExpenseEntity, toExpenseDb } from "@/features/expenses/expense-entity";
import { toWalletDb, WalletEntity } from "@/features/wallets/wallet-entity";
import { jwt } from "@/http/lib/jwt";
import { bcrypt } from "@/lib/bcrypt";
import { uuid } from "@/lib/uuid";

export const randomPass = () => uuid().substring(0, 8);
export const randomEmail = () => `${uuid()}@example.com`;

export type TestUser = {
  id: string;
  email: string;
  token: string;
  password: string;
};

export async function createTestUser(): Promise<TestUser> {
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

  return {
    id: user.id,
    email: user.email,
    token: jwt.sign(user.id),
    password: plainText,
  };
}

export async function removeTestUser(id: string): Promise<void> {
  await db("users").delete().where("id", "=", id);
}

export async function createUser(): Promise<TestUser> {
  const user = await createTestUser();
  onTestFinished(() => removeTestUser(user.id));
  return user;
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

export async function createWallet(
  userId: string,
  partial?: Partial<WalletEntity>,
): Promise<WalletEntity> {
  const id = uuid();
  const now = new Date();
  const entity: WalletEntity = {
    name: "Main",
    ...partial,
    id,
    createdAt: now,
    updatedAt: now,
    userId,
  };

  await db("wallets").insert(toWalletDb(entity));
  onTestFinished(async () => {
    await db("wallets").delete().where("id", "=", id);
  });
  return entity;
}
