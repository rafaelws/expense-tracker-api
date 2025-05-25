import Decimal from "decimal.js";
import { z } from "zod";

const occurredAt = z.string().date();

const minValue = new Decimal("0.01");
const maxValue = new Decimal("99999999.99");

const amount = z.string().superRefine((arg, ctx) => {
  try {
    const decimal = new Decimal(arg);

    if (!decimal.isFinite()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount must be a finite number",
      });
      return;
    }

    if (decimal.decimalPlaces() > 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Max 2 decimal places allowed",
      });
      return;
    }

    if (decimal.lt(minValue)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Must be greater than 0 (at least 0.01)",
      });
      return;
    }

    if (decimal.gt(maxValue)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exceeds the maximum value",
      });
      return;
    }
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid decimal format",
    });
  }
});

export const createExpenseSchema = z.object({
  title: z.string().max(255).trim().nonempty(),
  occurredAt,
  amount,
  status: z.number().int().positive(),
  description: z.string().trim().nonempty().optional(),
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
