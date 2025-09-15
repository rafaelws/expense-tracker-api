import { and, eq } from "drizzle-orm";
import { expect, onTestFinished } from "vitest";
import { db } from "@/db/client";
import {
  expensesTable,
  tagsExpensesTable,
  tagsTable,
  usersTable,
  walletsTable,
} from "@/db/schema";
import type { ExpenseEntity } from "@/features/expenses/expense-entity";
import type { PublicExpense } from "@/features/expenses/expense-mapper";
import type { TagEntity } from "@/features/tags/tag-entity";
import type { WalletEntity } from "@/features/wallets/wallet-entity";
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
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(usersTable).values(user);

  return {
    id: user.id,
    email: user.email,
    token: jwt.sign(user.id),
    password: plainText,
  };
}

export async function removeTestUser(id: string): Promise<void> {
  await db.delete(usersTable).where(eq(usersTable.id, id));
}

export async function createIsolatedTestUser(
  useTrueHashing = false,
): Promise<TestUser> {
  const user = await createTestUser(useTrueHashing);
  onTestFinished(() => removeTestUser(user.id));
  return user;
}

export async function removeUserByEmail(email: string) {
  await db.delete(usersTable).where(eq(usersTable.email, email));
}

export async function removeExpense(id: string) {
  await db.delete(expensesTable).where(eq(expensesTable.id, id));
}

export async function createExpense(
  userId: string,
  partial?: Partial<ExpenseEntity>,
  removeOnFinish = true,
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

  await db.insert(expensesTable).values(expense);

  if (removeOnFinish) {
    onTestFinished(async () => {
      await removeExpense(id);
    });
  }
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

  await db.insert(walletsTable).values(entity);
  onTestFinished(async () => {
    await db.delete(walletsTable).where(eq(walletsTable.id, id));
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

  await db.insert(tagsTable).values(entity);

  if (expenseIds && expenseIds.length > 0) {
    await Promise.all(
      expenseIds.map((expenseId) => {
        return db.insert(tagsExpensesTable).values({
          tagId: id,
          expenseId,
          createdAt: new Date(),
        });
      }),
    );
  }

  onTestFinished(async () => {
    await db.delete(tagsTable).where(eq(tagsTable.id, id));
    if (expenseIds && expenseIds.length > 0) {
      await Promise.all(
        expenseIds.map((expenseId) => {
          return db
            .delete(tagsExpensesTable)
            .where(
              and(
                eq(tagsExpensesTable.expenseId, expenseId),
                eq(tagsExpensesTable.tagId, id),
              ),
            );
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
