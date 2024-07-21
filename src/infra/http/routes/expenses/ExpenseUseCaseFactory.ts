import { CreateExpense } from "@/features/expenses/CreateExpense";
import { numberHelper } from "@/infra/common";
import { DatabaseExpenseRepo } from "@/infra/db/repos";

const repo = new DatabaseExpenseRepo();

export const ExpenseUseCaseFactory = {
  createExpense() {
    return new CreateExpense(repo, numberHelper);
  },
};
