import { BigNumber, isEmptyString } from "../common";
import { ChangeableExpense, ExpenseRepo, ReadableExpense } from "./ExpenseRepo";

export class UpdateExpense {
  constructor(
    private readonly repo: ExpenseRepo,
    private readonly big: BigNumber,
  ) {}

  private isValidAmount(amount: string) {
    return !isEmptyString(amount) && this.big.gt(amount, 0);
  }

  async perform(
    id: string,
    userId: string,
    expense: Partial<ChangeableExpense>,
  ): Promise<Partial<ReadableExpense> | null> {
    if (expense.amount && !this.isValidAmount(expense.amount)) return null;
    if (expense.description && isEmptyString(expense.description)) return null;

    const existing = await this.repo.one(id, userId);
    if (existing === null) return null;

    return this.repo.update(id, userId, expense);
  }
}
