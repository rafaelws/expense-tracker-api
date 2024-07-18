import { ChangeableExpense, ExpenseRepo, ReadableExpense } from "./ExpenseRepo";

export class UpdateExpense {
  constructor(private readonly repo: ExpenseRepo) {}

  async perform(
    id: string,
    userId: string,
    expense: Partial<ChangeableExpense>,
  ): Promise<ReadableExpense | null> {
    if (expense.amount && expense.amount < 0) return null;
    if (expense.description && expense.description.trim().length === 0)
      return null;

    return this.repo.update(id, userId, expense);
  }
}
