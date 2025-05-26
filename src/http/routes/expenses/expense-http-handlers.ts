import { Response } from "express";

import { ExpenseRepository } from "@/features/expenses/expense-repository";
import {
  CreateExpenseDTO,
  UpdateExpenseDTO,
} from "@/features/expenses/expense-schema";
import { ExpenseService } from "@/features/expenses/expense-service";
import { HandlerRequest } from "@/http/lib/types";

import { ListExpenseQuerySchema } from "./expense-http-schemas";

const expenseService = new ExpenseService(new ExpenseRepository());

export async function postExpense(
  req: HandlerRequest<CreateExpenseDTO>,
  res: Response,
) {
  const result = await expenseService.createExpense(req.userId!, req.body);
  return res.status(201).json(result);
}

export async function getExpenses(
  req: HandlerRequest<undefined, ListExpenseQuerySchema>,
  res: Response,
) {
  const result = await expenseService.listExpenses(req.userId!, req.query);
  return res.status(200).json(result);
}

export async function putExpense(
  req: HandlerRequest<UpdateExpenseDTO>,
  res: Response,
) {
  const result = await expenseService.updateExpense(
    req.params.id,
    req.userId!,
    req.body,
  );
  return res.json(result);
}

export async function deleteExpense(req: HandlerRequest, res: Response) {
  await expenseService.deleteExpense(req.params.id, req.userId!);
  return res.sendStatus(204);
}
