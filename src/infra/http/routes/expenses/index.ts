import { Router } from "express";

import { ensureAuthenticated } from "../../middlewares";
import { ExpenseUseCaseFactory } from "./ExpenseUseCaseFactory";
import { createExpenseHandler } from "./post-expense";

export const expensesRouter = Router();

const createExpense = ExpenseUseCaseFactory.createExpense();

expensesRouter.post(
  "/expenses",
  ensureAuthenticated,
  createExpenseHandler(createExpense),
);
