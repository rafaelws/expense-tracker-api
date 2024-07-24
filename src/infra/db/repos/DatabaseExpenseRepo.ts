import { and, between, desc, eq } from "drizzle-orm";

import {
  ChangeableExpense,
  Expense,
  ExpenseRepo,
  ReadableExpense,
} from "@/features/expenses/ExpenseRepo";
import { genid } from "@/infra/common";

import { db } from "..";
import { expenses } from "../schema";

export class DatabaseExpenseRepo implements ExpenseRepo {
  async create(
    userId: string,
    expense: ChangeableExpense,
  ): Promise<ReadableExpense> {
    const toInsert = { id: genid(), ...expense };
    const time = new Date();
    await db.insert(expenses).values({
      ...toInsert,
      userId,
      createdAt: time,
      updatedAt: time,
    });
    return toInsert;
  }

  async remove(id: string, userId: string): Promise<void> {
    await db
      .delete(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.id, id)));
  }

  async update(
    id: string,
    userId: string,
    expense: Partial<ChangeableExpense>,
  ): Promise<Partial<ReadableExpense>> {
    await db
      .update(expenses)
      .set({ ...expense, updatedAt: new Date() })
      .where(and(eq(expenses.userId, userId), eq(expenses.id, id)));

    return { id, ...expense };
  }

  async get(userId: string, from: Date, to: Date): Promise<ReadableExpense[]> {
    return db
      .select({
        id: expenses.id,
        amount: expenses.amount,
        date: expenses.date,
        description: expenses.description,
      })
      .from(expenses)
      .where(and(eq(expenses.userId, userId), between(expenses.date, from, to)))
      .orderBy(desc(expenses.date))
      .limit(50);
  }

  async one(id: string, userId: string): Promise<Expense | null> {
    const results = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.id, id)))
      .limit(1);

    return results.length > 0 ? results[0] : null;
  }
}
