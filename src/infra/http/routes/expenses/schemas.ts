import { z } from "zod";

import { PERIODS } from "@/features/expenses/GetExpenses";
import { numberHelper } from "@/infra/common";

const date = z
  .string()
  .date()
  .refine((val) => !isNaN(Date.parse(val)))
  .transform((val) => new Date(val));

export const createSchema = z.object({
  description: z.string(),
  amount: z.string().refine((val) => numberHelper.isValid(val)),
  date,
});

export const updateSchema = createSchema
  .partial()
  .refine(({ description, amount, date }) => description || amount || date, {
    message:
      "At least one of 'description', 'amount', or 'date' must be provided",
  });

export const getExpensesQuerySchema = z.object({
  ref: date,
  period: z.enum(PERIODS),
});

export type GetExpensesQuery = z.infer<typeof getExpensesQuerySchema>;
