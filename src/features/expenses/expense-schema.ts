import Decimal from "decimal.js";
import { z } from "zod/v4";

import { EXPENSE_STATUS } from "./expense-entity";

const occurredAt = z.iso.date().meta({ example: "2025-12-31" });

const minValue = new Decimal("0.01");
const maxValue = new Decimal("99999999.99");

const amount = z
  .string()
  .check((ctx) => {
    try {
      const decimal = new Decimal(ctx.value);

      if (!decimal.isFinite()) {
        ctx.issues.push({
          code: "invalid_value",
          message: "Amount must be a finite number",
          input: ctx.value,
          values: [],
        });
        return;
      }

      if (decimal.decimalPlaces() > 2) {
        ctx.issues.push({
          code: "custom",
          message: "Amount cannot have more than 2 decimal places",
          input: ctx.value,
        });
        return;
      }

      if (decimal.lt(minValue)) {
        ctx.issues.push({
          code: "custom",
          message: "Must be greater than 0 (at least 0.01)",
          input: ctx.value,
        });
        return;
      }

      if (decimal.gt(maxValue)) {
        ctx.issues.push({
          code: "custom",
          message: "Exceeds the maximum value",
          input: ctx.value,
        });
        return;
      }
    } catch {
      ctx.issues.push({
        code: "custom",
        message: "Invalid amount format",
        input: ctx.value,
      });
    }
  })
  .meta({
    example: "150.50",
    minLength: 4,
    maxLength: 11,
    description: `Range: 0.01 - 99999999.99`,
  });

export const createExpenseSchema = z.object({
  title: z
    .string()
    .max(255)
    .trim()
    .nonempty()
    .meta({ example: "Weekly grocery" }),
  description: z
    .string()
    .trim()
    .nonempty()
    .optional()
    .meta({ example: "Chicken, vegetables and rice" }),
  occurredAt,
  amount,
  status: z
    .enum(EXPENSE_STATUS)
    .meta({ description: "1=PAID, 2=PENDING", example: 1 }),
  walletId: z
    .uuid()
    .optional()
    .meta({ example: "e8434b44-5e82-4fb9-896e-67337eae2c6b" }),
  tagIds: z
    .array(z.uuid())
    .optional()
    .meta({
      example: ["f210f03f-fdac-44d2-b98b-6e5a5805cef3"],
    }),
});

export type CreateExpenseDTO = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema
  .partial()
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message:
      "At least one of these fields must be provided: description, title, occurredAt, amount, status, walletId, tagIds",
    path: [],
  });

export type UpdateExpenseDTO = z.infer<typeof updateExpenseSchema>;
