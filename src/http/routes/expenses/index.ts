import { Router } from "express";

import { httpRoute } from "@/http/lib/adapter";

import {
  deleteExpense,
  getExpenses,
  getLatestExpenses,
  postExpense,
  putExpense,
} from "./expense-http-handlers";

export const expensesRouter = Router();

expensesRouter
  .route("/expenses")
  .post(httpRoute(postExpense))
  .get(httpRoute(getExpenses));

expensesRouter
  .route("/expenses/:id")
  .put(httpRoute(putExpense))
  .delete(httpRoute(deleteExpense));

expensesRouter.get("/expenses/latest", httpRoute(getLatestExpenses));
