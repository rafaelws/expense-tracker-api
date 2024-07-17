import { ExpenseRepo } from "./ExpenseRepo";

export class RemoveExpense {
  constructor(private readonly repo: ExpenseRepo) {}

  async perform(id: string, userId: string): Promise<void> {
    await this.repo.remove(id, userId);
  }
}
