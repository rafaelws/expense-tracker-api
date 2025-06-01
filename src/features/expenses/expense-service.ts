import { InvalidParameterError, ResourceNotFoundError } from "@/lib/errors";
import { uuid } from "@/lib/uuid";

import { PublicWallet, toPublicWallet } from "../wallets/wallet-mapper";
import { ExpenseEntity } from "./expense-entity";
import { calculateExpenseInterval, ExpensePeriod } from "./expense-interval";
import { PublicExpense, toPublicExpense } from "./expense-mapper";
import { ExpenseRepository } from "./expense-repository";
import { CreateExpenseDTO, UpdateExpenseDTO } from "./expense-schema";

export type PublicExpenseList = Array<{
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
    { reference, period }: { reference: string; period: ExpensePeriod },
  ): Promise<PublicExpenseList> {
    const result = calculateExpenseInterval(reference, period);
    if (result === null)
      throw new InvalidParameterError(
        "period",
        "Invalid period or time interval",
      );

    const results = await this.expenseRepository.findAll(
      userId,
      result.from,
      result.to,
    );

    if (!results.length) return [];

    const publicExpenseList: PublicExpenseList = [];
    for (const { wallet, expenses } of results) {
      publicExpenseList.push({
        wallet: wallet ? toPublicWallet(wallet) : null,
        expenses: expenses.map(toPublicExpense),
      });
    }
    return publicExpenseList;
  }
}
