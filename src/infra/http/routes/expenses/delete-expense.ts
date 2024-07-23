import { Request, Response } from "express";

import { RemoveExpense } from "@/features/expenses/RemoveExpense";
import { badRequest, serverError } from "@/infra/common";

export const deleteExpenseHandler =
  (useCase: RemoveExpense) => async (req: Request, res: Response) => {
    try {
      const id = await useCase.perform(req.params.id, req.userId!);
      if (id === null) return badRequest(res, "Expense not found.");
      return res.sendStatus(204);
    } catch (e) {
      return serverError(res, e);
    }
  };
