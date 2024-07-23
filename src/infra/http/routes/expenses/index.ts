import { Router } from "express";

import {
  ensureAuthenticated,
  ensureSchema,
  ensureValidId,
} from "../../middlewares";
import { deleteExpenseHandler } from "./delete-expense";
import { ExpenseUseCaseFactory } from "./ExpenseUseCaseFactory";
import { createExpenseHandler } from "./post-expense";
import { updateExpenseHandler } from "./put-expense";
import { createSchema, updateSchema } from "./schemas";

export const expensesRouter = Router();

const createExpense = ExpenseUseCaseFactory.createExpense();
const updateExpense = ExpenseUseCaseFactory.updateExpense();
const removeExpense = ExpenseUseCaseFactory.removeExpense();

expensesRouter.post(
  "/expenses",
  ensureAuthenticated,
  ensureSchema(createSchema),
  createExpenseHandler(createExpense),
);

expensesRouter
  .route("/expenses/:id")
  .all(ensureAuthenticated, ensureValidId)
  .put(ensureSchema(updateSchema), updateExpenseHandler(updateExpense))
  .delete(deleteExpenseHandler(removeExpense));
