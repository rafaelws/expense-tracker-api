import { InvalidParameterError, ResourceNotFoundError } from "@/lib/errors";
import { uuid } from "@/lib/uuid";

import { type PublicWallet, toPublicWallet } from "../wallets/wallet-mapper";
import type { ExpenseEntity } from "./expense-entity";
import { lastNDays, monthInterval } from "./expense-interval";
import { type PublicExpense, toPublicExpense } from "./expense-mapper";
import type { ExpenseRepository } from "./expense-repository";
import type { CreateExpenseDTO, UpdateExpenseDTO } from "./expense-schema";

export type PublicGroupedExpenseList = Array<{
  wallet: PublicWallet | null;
  expenses: PublicExpense[];
}>;

export class ExpenseService {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  private async throwIfInvalid(
    userId: string,
    walletId?: string,
    tagIds?: string[],
  ) {
    if (
      walletId !== undefined &&
      !(await this.expenseRepository.isWalletOwnedByUser(userId, walletId))
    ) {
      throw new InvalidParameterError(
        "walletId",
        "provided wallet id does not belong to user",
      );
    }

    if (tagIds !== undefined && tagIds.length > 0) {
      const uniqueTagIds = [...new Set(tagIds)];

      const areAllTagsValid = await this.expenseRepository.areTagsOwnedByUser(
        userId,
        uniqueTagIds,
      );

      if (!areAllTagsValid) {
        throw new InvalidParameterError(
          "tagIds",
          "provided tagIds do not belong to user",
        );
      }
    }
  }

  public async createExpense(
    userId: string,
    dto: CreateExpenseDTO,
  ): Promise<PublicExpense> {
    await this.throwIfInvalid(userId, dto.walletId, dto.tagIds);

    const now = new Date();
    const entity: ExpenseEntity = {
      ...dto,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
      userId,
    };

    await this.expenseRepository.create(entity);

    return toPublicExpense(entity);
  }

  public async updateExpense(
    id: string,
    userId: string,
    dto: UpdateExpenseDTO,
  ): Promise<PublicExpense> {
    await this.throwIfInvalid(userId, dto.walletId, dto.tagIds);

    const entity = await this.expenseRepository.findFirst(id, userId);
    if (!entity) throw new ResourceNotFoundError(`Expense#${id}`);

    const toUpdate = {
      ...dto,
      updatedAt: new Date(),
    };

    await this.expenseRepository.update(id, userId, toUpdate);
    return toPublicExpense({ ...entity, ...toUpdate });
  }

  public async deleteExpense(id: string, userId: string): Promise<void> {
    const entity = await this.expenseRepository.findFirst(id, userId);
    if (!entity) throw new ResourceNotFoundError(`Expense#${id}`);

    await this.expenseRepository.remove(id, userId);
  }

  public async listExpenses(
    userId: string,
    monthWithYear: string, // yyyy-MM
  ): Promise<PublicGroupedExpenseList> {
    const interval = monthInterval(monthWithYear);
    if (interval === null) {
      throw new InvalidParameterError(
        "month",
        "Expected format: yyyy-MM (e.g. '2025-01')",
      );
    }

    const results = await this.expenseRepository.findAllHydrated(
      userId,
      interval.from,
      interval.to,
    );

    if (!results.length) return [];

    const publicExpenseList: PublicGroupedExpenseList = [];
    for (const { wallet, expenses } of results) {
      publicExpenseList.push({
        wallet: wallet ? toPublicWallet(wallet) : null,
        expenses: expenses.map(toPublicExpense),
      });
    }
    return publicExpenseList;
  }

  public async listLatestExpenses(
    userId: string,
    nDays: number,
  ): Promise<Array<PublicExpense>> {
    const interval = lastNDays(nDays);
    const expenses = await this.expenseRepository.findAll(
      userId,
      interval.from,
      interval.to,
    );
    return !expenses.length ? [] : expenses.map(toPublicExpense);
  }
}
