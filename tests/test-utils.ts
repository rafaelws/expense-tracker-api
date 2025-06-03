import { expect, onTestFinished } from "vitest";

import { db } from "@/db/client";
import { ExpenseEntity, toExpenseDb } from "@/features/expenses/expense-entity";
import { PublicExpense } from "@/features/expenses/expense-mapper";
import { TagEntity, toTagDb } from "@/features/tags/tag-entity";
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

export async function createTestUser(
  useTrueHashing = false,
): Promise<TestUser> {
  const plainText = useTrueHashing ? randomPass() : "mockpass";
  const password = useTrueHashing
    ? await bcrypt.hash(plainText)
    : "$2a$10$s9hmwAsj9aPh22DRwBDBge1VpzI803rBrwA3SVEF6BBCJ/IKwBpSu";

  const now = new Date();
  const user = {
    id: uuid(),
    email: randomEmail(),
    password,
    created_at: now,
    updated_at: now,
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

export async function createIsolatedTestUser(
  useTrueHashing = false,
): Promise<TestUser> {
  const user = await createTestUser(useTrueHashing);
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

export async function createTag(
  userId: string,
  partial?: Partial<TagEntity>,
  expenseIds?: string[],
): Promise<TagEntity> {
  const id = uuid();
  const now = new Date();
  const entity: TagEntity = {
    name: "Food",
    ...partial,
    id,
    createdAt: now,
    updatedAt: now,
    userId,
  };

  await db("tags").insert(toTagDb(entity));
  if (expenseIds && expenseIds.length > 0) {
    await Promise.all(
      expenseIds.map((expense_id) => {
        return db("tags_expenses").insert({
          expense_id,
          tag_id: id,
          created_at: new Date(),
        });
      }),
    );
  }
  onTestFinished(async () => {
    await db("tags").delete().where("id", "=", id);
    if (expenseIds && expenseIds.length > 0) {
      await Promise.all(
        expenseIds.map((expense_id) => {
          return db("tags_expenses")
            .delete()
            .where("expense_id", "=", expense_id)
            .andWhere("tag_id", "=", id);
        }),
      );
    }
  });
  return entity;
}

export function expectExpenseMatch(
  response: PublicExpense,
  expected: Partial<ExpenseEntity>,
) {
  expect(response).toHaveProperty("id");
  expect(response.amount).toBe(expected.amount);
  expect(response.title).toBe(expected.title);
  expect(response.occurredAt).toBe(expected.occurredAt);
  expect(response.status).toBe(expected.status);

  expect(response.description ?? null).toBe(expected.description ?? null);
  expect(response.walletId ?? null).toBe(expected.walletId ?? null);

  const actualTags = (response.tagIds ?? []).sort();
  const expectedTags = (expected.tagIds ?? []).sort();
  expect(actualTags).toEqual(expectedTags);

  const forbiddenKeys = [
    "userId",
    "user_id",
    "createdAt",
    "created_at",
    "updatedAt",
    "updated_at",
  ];
  for (const key of forbiddenKeys) {
    expect(response).not.toHaveProperty(key);
  }
}
