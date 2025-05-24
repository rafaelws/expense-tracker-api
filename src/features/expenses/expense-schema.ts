import Decimal from "decimal.js";
import { z } from "zod/v4";

const occurredAt = z.iso.date().transform((arg) => new Date(arg));

const amount = z.string().refine(
  (arg) => {
    try {
      const decimal = new Decimal(arg);
      return decimal.gt("0");
    } catch {
      return false;
    }
  },
  {
    message: "amount must be a valid decimal greater than 0.",
  },
);

export const createExpenseSchema = z.object({
  title: z.string().trim(),
  occurredAt,
  amount,
  status: z.number().int().positive(),
  description: z.string().trim().optional(),
});

export type CreateExpenseDTO = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema
  .partial()
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message:
      "At least one of these fields must be provided: description, title, occurredAt, amount, status",
    path: [],
  });

export type UpdateExpenseDTO = z.infer<typeof updateExpenseSchema>;
