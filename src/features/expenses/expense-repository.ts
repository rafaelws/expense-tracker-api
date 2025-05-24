import { db } from "@/db/client";

import {
  ExpenseDb,
  ExpenseEntity,
  toExpenseDb,
  toExpenseEntity,
  toUpdatebleExpenseDb,
} from "./expense-entity";

export class ExpenseRepository {
  public async create(entity: ExpenseEntity): Promise<ExpenseEntity> {
    await db("expenses").insert(toExpenseDb(entity));
    return entity;
  }

  public async remove(id: string, userId: string): Promise<void> {
    await db("expenses")
      .delete()
      .where("id", "=", id)
      .andWhere("user_id", "=", userId);
  }

  public async update(
    id: string,
    userId: string,
    entity: Partial<ExpenseEntity>,
  ): Promise<Partial<ExpenseEntity>> {
    await db("expenses")
      .update(toUpdatebleExpenseDb(entity))
      .where("id", "=", id)
      .andWhere("user_id", "=", userId);

    return entity;
  }

  public async finAll(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<ExpenseEntity[]> {
    const results = await db<ExpenseDb>("expenses")
      .select()
      .where("user_id", "=", userId)
      .andWhereBetween("occurred_at", [from, to])
      .orderBy("occured_at", "desc");

    return results.length > 0 ? results.map(toExpenseEntity) : [];
  }

  public async findFirst(
    id: string,
    userId: string,
  ): Promise<ExpenseEntity | null> {
    const result = await db<ExpenseDb>("expenses")
      .select()
      .where("user_id", "=", userId)
      .andWhere("id", "=", id)
      .first();

    return result === undefined ? null : toExpenseEntity(result);
  }
}
