import { ExpenseRepository } from "@/features/expenses/expense-repository";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/features/expenses/expense-schema";
import { ExpenseService } from "@/features/expenses/expense-service";
import { auth } from "@/http/lib/auth";
import { HttpRequest, reply } from "@/http/lib/types";
import { validate } from "@/http/lib/validate";

import {
  listExpensesQuerySchema,
  listLatestExpensesQuerySchema,
} from "./expense-http-schemas";

const expenseService = new ExpenseService(new ExpenseRepository());

export async function postExpense({ headers, body }: HttpRequest) {
  const userId = auth(headers);
  const dto = validate(body, createExpenseSchema);
  const result = await expenseService.createExpense(userId, dto);
  return reply(201, result);
}

export async function getExpenses({ headers, query }: HttpRequest) {
  const userId = auth(headers);
  const { month } = validate(query, listExpensesQuerySchema);
  const result = await expenseService.listExpenses(userId, month);
  return reply(200, result);
}

export async function getLatestExpenses({ headers, query }: HttpRequest) {
  const userId = auth(headers);
  const { days } = validate(query, listLatestExpensesQuerySchema);
  const result = await expenseService.listLatestExpenses(userId, days);
  return reply(200, result);
}

export async function putExpense({ headers, params, body }: HttpRequest) {
  const userId = auth(headers);
  const dto = validate(body, updateExpenseSchema);
  const result = await expenseService.updateExpense(params.id, userId, dto);
  return reply(200, result);
}

export async function deleteExpense({ headers, params }: HttpRequest) {
  const userId = auth(headers);
  await expenseService.deleteExpense(params.id, userId);
  return reply(204);
}
