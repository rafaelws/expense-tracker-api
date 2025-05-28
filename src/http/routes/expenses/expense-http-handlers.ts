import { ExpenseRepository } from "@/features/expenses/expense-repository";
import {
  CreateExpenseDTO,
  UpdateExpenseDTO,
} from "@/features/expenses/expense-schema";
import {
  ExpenseService,
  ExposableExpense,
} from "@/features/expenses/expense-service";
import { HandlerRequest, HandlerResponse } from "@/http/lib/types";

import { ListExpenseQuerySchema } from "./expense-http-schemas";

const expenseService = new ExpenseService(new ExpenseRepository());

export async function postExpense(
  req: HandlerRequest<CreateExpenseDTO>,
  res: HandlerResponse<ExposableExpense>,
) {
  const result = await expenseService.createExpense(
    res.locals.userId,
    req.body,
  );
  return res.status(201).json(result);
}

export async function getExpenses(
  req: HandlerRequest<undefined, ListExpenseQuerySchema>,
  res: HandlerResponse<ExposableExpense[]>,
) {
  const result = await expenseService.listExpenses(
    res.locals.userId,
    req.query,
  );
  return res.status(200).json(result);
}

export async function putExpense(
  req: HandlerRequest<UpdateExpenseDTO>,
  res: HandlerResponse<ExposableExpense>,
) {
  const result = await expenseService.updateExpense(
    req.params.id,
    res.locals.userId,
    req.body,
  );
  return res.json(result);
}

export async function deleteExpense(req: HandlerRequest, res: HandlerResponse) {
  await expenseService.deleteExpense(req.params.id, res.locals.userId);
  return res.sendStatus(204);
}
