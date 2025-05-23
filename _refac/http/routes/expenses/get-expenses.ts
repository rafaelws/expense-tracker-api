import { Request, Response } from "express";

import { GetExpense } from "@/features/expenses/GetExpenses";
import { validateSchema } from "@/infra/common";

import { badRequest, serverError } from "../../common";
import { GetExpensesQuery, getExpensesQuerySchema } from "./schemas";

export const getExpensesHandler =
  (useCase: GetExpense) => async (req: Request, res: Response) => {
    try {
      const [error, data] = validateSchema<GetExpensesQuery>(
        getExpensesQuerySchema,
        req.query,
      );

      if (data === null) {
        return badRequest(res, error || "Invalid query parameters");
      }

      const expenses = await useCase.perform(
        req.userId!,
        data.ref,
        data.period,
      );

      return res.status(200).json(expenses);
    } catch (e) {
      return serverError(res, e);
    }
  };
