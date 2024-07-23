import { ExpenseRepo } from "./ExpenseRepo";

export class RemoveExpense {
  constructor(private readonly repo: ExpenseRepo) {}

  async perform(id: string, userId: string): Promise<string | null> {
    const expense = await this.repo.one(id, userId);
    if (expense === null) return null;

    await this.repo.remove(id, userId);
    return id;
  }
}
