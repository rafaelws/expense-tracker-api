import { z } from "zod";

import { EXPENSE_PERIODS } from "@/features/expenses/expense-interval";

export const listExpensesQuerySchema = z.object({
  period: z.enum(EXPENSE_PERIODS),
  reference: z.string().date(),
});

export type ListExpenseQuerySchema = z.infer<typeof listExpensesQuerySchema>;
