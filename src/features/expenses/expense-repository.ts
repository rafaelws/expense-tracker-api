import { and, between, desc, eq, inArray } from "drizzle-orm";
import { db, type Transaction } from "@/db/client";
import {
  expensesTable,
  tagsExpensesTable,
  tagsTable,
  walletsTable,
} from "@/db/schema";
import type { TagEntity } from "../tags/tag-entity";
import type { WalletEntity } from "../wallets/wallet-entity";
import type { ExpenseEntity } from "./expense-entity";

export type ExpenseGroupedByWallet = Array<{
  wallet: WalletEntity | null;
  expenses: ExpenseEntity[];
}>;

export class ExpenseRepository {
  public async create(entity: ExpenseEntity): Promise<ExpenseEntity> {
    await db.transaction(async (trx) => {
      await trx.insert(expensesTable).values(entity);
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
      await trx
        .update(expensesTable)
        .set(entity)
        .where(and(eq(expensesTable.id, id), eq(expensesTable.userId, userId)));

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
    trx: Transaction,
  ): Promise<void> {
    if (tagIds === undefined || !Array.isArray(tagIds)) return;

    // Important: an empty array means "remove all tags from the expense"
    // — intentional behavior
    await trx
      .delete(tagsExpensesTable)
      .where(eq(tagsExpensesTable.expenseId, expenseId));

    if (tagIds.length === 0) return;

    const batch = tagIds.map((tagId) => ({
      tagId,
      expenseId,
      createdAt: new Date(),
    }));

    await trx.insert(tagsExpensesTable).values(batch);
  }

  public async areTagsOwnedByUser(
    userId: string,
    tagIds: string[],
  ): Promise<boolean> {
    const results = await db.query.tagsTable.findMany({
      columns: { id: true },
      where: and(eq(tagsTable.userId, userId), inArray(tagsTable.id, tagIds)),
    });
    return tagIds.length === results.length;
  }

  public async isWalletOwnedByUser(
    userId: string,
    walletId: string,
  ): Promise<boolean> {
    const wallet = await db.query.walletsTable.findFirst({
      where: and(
        eq(walletsTable.userId, userId),
        eq(walletsTable.id, walletId),
      ),
    });
    return wallet !== undefined;
  }

  public async remove(id: string, userId: string): Promise<void> {
    await db
      .delete(expensesTable)
      .where(and(eq(expensesTable.id, id), eq(expensesTable.userId, userId)));
  }

  public async findFirst(
    id: string,
    userId: string,
  ): Promise<ExpenseEntity | null> {
    const expense = await db.query.expensesTable.findFirst({
      where: and(eq(expensesTable.userId, userId), eq(expensesTable.id, id)),
    });
    return expense ?? null;
  }

  private async getTags(
    expenseIds: string[],
  ): Promise<Map<string, TagEntity[]>> {
    if (!expenseIds.length) return new Map();

    const results = await db
      .select({
        expenseId: tagsExpensesTable.expenseId,
        id: tagsTable.id,
        name: tagsTable.name,
        fgColor: tagsTable.fgColor,
        bgColor: tagsTable.bgColor,
        createdAt: tagsTable.createdAt,
        updatedAt: tagsTable.updatedAt,
        userId: tagsTable.userId,
      })
      .from(tagsExpensesTable)
      .where(inArray(tagsExpensesTable.expenseId, expenseIds))
      .innerJoin(tagsTable, eq(tagsTable.id, tagsExpensesTable.tagId));

    if (!results.length) return new Map();

    const tagMap = new Map<string, TagEntity[]>();
    for (const { expenseId, ...tag } of results) {
      if (!tagMap.has(expenseId)) {
        tagMap.set(expenseId, []);
      }
      tagMap.get(expenseId)?.push(tag); // TODO watch
    }
    return tagMap;
  }

  private async getWallets(
    walletIds: string[],
  ): Promise<Map<string, WalletEntity>> {
    if (!walletIds.length) return new Map();

    const results = await db.query.walletsTable.findMany({
      where: inArray(walletsTable, walletIds),
    });
    if (!results.length) return new Map();

    const walletMap = new Map<string, WalletEntity>();
    for (const wallet of results) {
      walletMap.set(wallet.id, wallet);
    }
    return walletMap;
  }

  private async hydrateExpenses(
    expenses: ExpenseEntity[],
  ): Promise<ExpenseGroupedByWallet> {
    const expenseIds: string[] = [];
    const walletIds = new Set<string>();

    for (const expense of expenses) {
      expenseIds.push(expense.id);
      if (expense.walletId) walletIds.add(expense.walletId);
    }

    const [tagMap, walletMap] = await Promise.all([
      this.getTags(expenseIds),
      this.getWallets([...walletIds]),
    ]);

    const responseMap = new Map<string | null, ExpenseEntity[]>();
    responseMap.set(null, []);

    for (const expense of expenses) {
      expense.tags = tagMap?.get(expense.id);

      const walletId = expense.walletId ?? null;
      if (!responseMap.has(walletId)) {
        responseMap.set(walletId, []);
      }
      responseMap.get(walletId)?.push(expense);
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
  ): Promise<ExpenseEntity[]> {
    const expenses = await db.query.expensesTable.findMany({
      where: and(
        eq(expensesTable.userId, userId),
        between(expensesTable, from, to),
      ),
      orderBy: desc(expensesTable.occurredAt),
    });

    return expenses.length > 0 ? expenses : [];
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
    return this.findAllBetween(userId, from, to);
  }
}
