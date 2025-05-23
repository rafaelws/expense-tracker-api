import { CreateExpense } from "@/features/expenses/CreateExpense";
import { GetExpense } from "@/features/expenses/GetExpenses";
import { RemoveExpense } from "@/features/expenses/RemoveExpense";
import { UpdateExpense } from "@/features/expenses/UpdateExpense";
import { numberHelper } from "@/infra/common";
import { DatabaseExpenseRepo } from "@/infra/db/repos";

const repo = new DatabaseExpenseRepo();

export const ExpenseUseCaseFactory = {
  createExpense() {
    return new CreateExpense(repo, numberHelper);
  },
  removeExpense() {
    return new RemoveExpense(repo);
  },
  updateExpense() {
    return new UpdateExpense(repo, numberHelper);
  },
  getExpenses() {
    return new GetExpense(repo);
  },
};
