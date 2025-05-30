import { Knex } from "knex";

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
    await db.transaction(async (trx) => {
      await trx("expenses").insert(toExpenseDb(entity));
      await this.associateTags(
        { expenseId: entity.id, tagIds: entity.tagIds },
        trx,
      );
    });
    return entity;
  }

  public async update(
    id: string,
    userId: string,
    entity: Partial<ExpenseEntity>,
  ): Promise<Partial<ExpenseEntity>> {
    await db.transaction(async (trx) => {
      await trx("expenses")
        .update(toUpdatebleExpenseDb(entity))
        .where("id", "=", id)
        .andWhere("user_id", "=", userId);

      await this.associateTags({ expenseId: id, tagIds: entity.tagIds }, trx);
    });
    return entity;
  }

  /**
   * Updates tag associations for an expense.
   * Must be called within a transaction.
   * Part of repository to maintain atomicity with expense updates.
   * @tagIds
   *  - `undefined`: no changes (keep everything as is)
   *  - `[] // (empty array)`: remove all tags
   *  - `["uuid", "uuid"]`: remove previous associations, associate the provided ones
   */
  private async associateTags(
    { expenseId, tagIds }: { expenseId: string; tagIds?: string[] },
    trx: Knex.Transaction,
  ): Promise<void> {
    if (tagIds === undefined || !Array.isArray(tagIds)) return;

    // Important: an empty array means "remove all tags from the expense" — intentional behavior
    await trx("tags_expenses").delete().where("expense_id", "=", expenseId);

    if (tagIds.length === 0) return;

    const batch = tagIds.map((tagId) => ({
      tag_id: tagId,
      expense_id: expenseId,
      created_at: new Date(),
    }));

    await trx("tags_expenses").insert(batch);
  }

  public async areTagsOwnedByUser(
    userId: string,
    tagIds: string[],
  ): Promise<boolean> {
    const validTags = await db("tags")
      .whereIn("id", tagIds)
      .andWhere("user_id", userId)
      .pluck("id");

    return tagIds.length === validTags.length;
  }

  public async isWalletOwnedByUser(
    userId: string,
    walletId: string,
  ): Promise<boolean> {
    const wallet = await db("wallets")
      .select("id")
      .where("user_id", "=", userId)
      .andWhere("id", "=", walletId)
      .first();

    return wallet !== undefined;
  }

  public async remove(id: string, userId: string): Promise<void> {
    await db("expenses")
      .delete()
      .where("id", "=", id)
      .andWhere("user_id", "=", userId);
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

  public async findAll(
    userId: string,
    from: string, // str date (yyyy-MM-dd)
    to: string, // str date (yyyy-MM-dd)
  ): Promise<ExpenseEntity[]> {
    // TODO group by wallet (outside SQL)
    // TODO include tags (left join or hydration)
    const results = await db<ExpenseDb>("expenses")
      .select()
      .where("user_id", "=", userId)
      .andWhereBetween("occurred_at", [from, to])
      .orderBy("occurred_at", "desc");

    return results.length > 0 ? results.map(toExpenseEntity) : [];
  }
}
