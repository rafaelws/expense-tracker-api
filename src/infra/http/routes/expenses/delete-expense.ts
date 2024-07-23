import { Request, Response } from "express";

import { RemoveExpense } from "@/features/expenses/RemoveExpense";
import { serverError } from "@/infra/common";

export const deleteExpenseHandler =
  (useCase: RemoveExpense) => async (req: Request, res: Response) => {
    try {
      await useCase.perform(req.params.id, req.userId!);
      return res.sendStatus(204);
    } catch (e) {
      return serverError(res, e);
    }
  };
