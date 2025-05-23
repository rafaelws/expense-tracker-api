import { BigNumber, isEmptyString } from "../common";
import { ChangeableExpense, ExpenseRepo, ReadableExpense } from "./ExpenseRepo";

export class CreateExpense {
  constructor(
    private readonly repo: ExpenseRepo,
    private readonly big: BigNumber,
  ) {}

  async perform(
    userId: string,
    expense: ChangeableExpense,
  ): Promise<ReadableExpense | null> {
    if (this.big.lte(expense.amount, 0)) return null;
    if (isEmptyString(expense.description)) return null;
    const { id } = await this.repo.create(userId, expense);
    return { id, ...expense };
  }
}
