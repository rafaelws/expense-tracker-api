import type { Knex } from "knex";

import { db } from "@/db/client";

import { type TagDb, type TagEntity, toTagEntity } from "../tags/tag-entity";
import {
  toWalletEntity,
  type WalletDb,
  type WalletEntity,
} from "../wallets/wallet-entity";
import {
  type ExpenseDb,
  type ExpenseEntity,
  toExpenseDb,
  toExpenseEntity,
  toUpdatebleExpenseDb,
} from "./expense-entity";

type TagWithExpenseId = TagDb & { expense_id: string };

export type ExpenseGroupedByWallet = Array<{
  wallet: WalletEntity | null;
  expenses: ExpenseEntity[];
}>;

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

  private async getTags(
    expenseIds: string[],
  ): Promise<Map<string, TagEntity[]>> {
    if (!expenseIds.length) return new Map();

    const results = await db<TagWithExpenseId>("tags_expenses")
      .select("expense_id", "tags.*")
      .whereIn("expense_id", expenseIds)
      .join("tags", "tags.id", "tags_expenses.tag_id");

    if (!results.length) return new Map();

    const tagMap = new Map<string, TagEntity[]>();
    for (const tagExpense of results) {
      if (!tagMap.has(tagExpense.expense_id)) {
        tagMap.set(tagExpense.expense_id, []);
      }
      tagMap.get(tagExpense.expense_id)?.push(toTagEntity(tagExpense)); // TODO watch
    }
    return tagMap;
  }

  private async getWallets(
    walletIds: string[],
  ): Promise<Map<string, WalletEntity>> {
    if (!walletIds.length) return new Map();

    const results = await db<WalletDb>("wallets").whereIn("id", walletIds);
    if (!results.length) return new Map();

    const walletMap = new Map<string, WalletEntity>();
    for (const db of results) {
      walletMap.set(db.id, toWalletEntity(db));
    }
    return walletMap;
  }

  private async hydrateExpenses(
    expenses: Array<ExpenseDb>,
  ): Promise<ExpenseGroupedByWallet> {
    const expenseIds: string[] = [];
    const walletIds = new Set<string>();

    for (const expense of expenses) {
      expenseIds.push(expense.id);
      if (expense.wallet_id) walletIds.add(expense.wallet_id);
    }

    const [tagMap, walletMap] = await Promise.all([
      this.getTags(expenseIds),
      this.getWallets([...walletIds]),
    ]);

    const responseMap = new Map<string | null, ExpenseEntity[]>();
    responseMap.set(null, []);

    for (const expense of expenses) {
      const entity = toExpenseEntity(expense);
      entity.tags = tagMap?.get(entity.id);

      const walletId = entity.walletId ?? null;
      if (!responseMap.has(walletId)) {
        responseMap.set(walletId, []);
      }
      responseMap.get(walletId)?.push(entity);
    }
    if (responseMap.get(null)!.length === 0) responseMap.delete(null);

    const groupedByWallet: ExpenseGroupedByWallet = [];
    for (const [walletId, expenses] of responseMap) {
      const wallet = walletId ? (walletMap?.get(walletId) ?? null) : null;
      groupedByWallet.push({ wallet, expenses });
    }
    return groupedByWallet;
  }

  private async findAllBetween(
    userId: string,
    from: string,
    to: string,
  ): Promise<Array<ExpenseDb>> {
    const results = await db<ExpenseDb>("expenses")
      .select()
      .where("user_id", "=", userId)
      .andWhereBetween("occurred_at", [from, to])
      .orderBy("occurred_at", "desc");

    return !results.length ? [] : results;
  }

  public async findAllHydrated(
    userId: string,
    from: string, // str date (yyyy-MM-dd)
    to: string, // str date (yyyy-MM-dd)
  ): Promise<ExpenseGroupedByWallet> {
    const results = await this.findAllBetween(userId, from, to);
    return this.hydrateExpenses(results);
  }

  public async findAll(
    userId: string,
    from: string, // str date (yyyy-MM-dd)
    to: string, // str date (yyyy-MM-dd)
  ): Promise<Array<ExpenseEntity>> {
    const results = await this.findAllBetween(userId, from, to);
    return results.map(toExpenseEntity);
  }
}
