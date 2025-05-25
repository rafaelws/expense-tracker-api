import { Router } from "express";

import {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/features/expenses/expense-schema";
import { ensureAuthenticated } from "@/http/middlewares/ensure-authenticated-middleware";
import {
  ensureBodySchema,
  ensureQuerySchema,
} from "@/http/middlewares/ensure-schema-middleware";

import {
  deleteExpense,
  getExpenses,
  postExpense,
  putExpense,
} from "./expense-http-handlers";
import { listExpensesQuerySchema } from "./expense-http-schemas";

export const expensesRouter = Router();

expensesRouter
  .route("/expenses")
  .all(ensureAuthenticated)
  .post(ensureBodySchema(createExpenseSchema), postExpense)
  .get(ensureQuerySchema(listExpensesQuerySchema), getExpenses);

expensesRouter
  .route("/expenses/:id")
  .all(ensureAuthenticated)
  .put(ensureBodySchema(updateExpenseSchema), putExpense)
  .delete(deleteExpense);
