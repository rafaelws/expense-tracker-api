import { ChangeableExpense, ExpenseRepo, ReadableExpense } from "./ExpenseRepo";

export class CreateExpense {
  constructor(private readonly repo: ExpenseRepo) {}

  async perform(
    userId: string,
    expense: ChangeableExpense,
  ): Promise<ReadableExpense | false> {
    if (expense.amount < 0) return false;
    if (expense.description.trim().length === 0) return false;
    const { id } = await this.repo.create(userId, expense);
    return { id, ...expense };
  }
}
