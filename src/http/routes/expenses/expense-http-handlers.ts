import { PublicExpense } from "@/features/expenses/expense-mapper";
import { ExpenseRepository } from "@/features/expenses/expense-repository";
import {
  CreateExpenseDTO,
  UpdateExpenseDTO,
} from "@/features/expenses/expense-schema";
import {
  ExpenseService,
  PublicExpenseList,
} from "@/features/expenses/expense-service";
import { HandlerRequest, HandlerResponse } from "@/http/lib/types";

import { ListExpenseQuerySchema } from "./expense-http-schemas";

const expenseService = new ExpenseService(new ExpenseRepository());

export async function postExpense(
  req: HandlerRequest<CreateExpenseDTO>,
  res: HandlerResponse<PublicExpense>,
) {
  const result = await expenseService.createExpense(
    res.locals.userId,
    req.body,
  );
  res.status(201).json(result);
}

export async function getExpenses(
  req: HandlerRequest<undefined, ListExpenseQuerySchema>,
  res: HandlerResponse<PublicExpenseList>,
) {
  const result = await expenseService.listExpenses(
    res.locals.userId,
    req.query,
  );
  res.status(200).json(result);
}

export async function putExpense(
  req: HandlerRequest<UpdateExpenseDTO>,
  res: HandlerResponse<PublicExpense>,
) {
  const result = await expenseService.updateExpense(
    req.params.id,
    res.locals.userId,
    req.body,
  );
  res.status(200).json(result);
}

export async function deleteExpense(req: HandlerRequest, res: HandlerResponse) {
  await expenseService.deleteExpense(req.params.id, res.locals.userId);
  res.sendStatus(204);
}
