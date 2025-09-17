import { isValid, parse } from "date-fns";
import { z } from "zod";

export const listLatestExpensesQuerySchema = z.object({
  days: z.coerce.number().min(15).max(45),
});

export type ListLatestExpensesQuerySchema = z.infer<
  typeof listLatestExpensesQuerySchema
>;

export const listExpensesQuerySchema = z.object({
  month: z
    .string()
    .trim()
    .nonempty("Required")
    .length(7, "Expected format: yyyy-MM")
    .refine((val) => isValid(parse(val, "yyyy-MM", new Date())), {
      message: "Expected valid month in yyyy-MM format (e.g. '2025-01')",
    }),
});

export type ListExpenseQuerySchema = z.infer<typeof listExpensesQuerySchema>;
