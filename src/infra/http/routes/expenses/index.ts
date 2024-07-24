import { Router } from "express";

import {
  ensureAuthenticated,
  ensureSchema,
  ensureValidId,
} from "../../middlewares";
import { deleteExpenseHandler } from "./delete-expense";
import { ExpenseUseCaseFactory } from "./ExpenseUseCaseFactory";
import { getExpensesHandler } from "./get-expenses";
import { createExpenseHandler } from "./post-expense";
import { updateExpenseHandler } from "./put-expense";
import { createSchema, updateSchema } from "./schemas";

export const expensesRouter = Router();

const createExpense = ExpenseUseCaseFactory.createExpense();
const updateExpense = ExpenseUseCaseFactory.updateExpense();
const removeExpense = ExpenseUseCaseFactory.removeExpense();
const getExpenses = ExpenseUseCaseFactory.getExpenses();

expensesRouter
  .route("/expenses")
  .all(ensureAuthenticated)
  .post(ensureSchema(createSchema), createExpenseHandler(createExpense))
  .get(getExpensesHandler(getExpenses));

expensesRouter
  .route("/expenses/:id")
  .all(ensureAuthenticated, ensureValidId)
  .put(ensureSchema(updateSchema), updateExpenseHandler(updateExpense))
  .delete(deleteExpenseHandler(removeExpense));
