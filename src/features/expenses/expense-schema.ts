import Decimal from "decimal.js";
import { z } from "zod/v4";

const occurredAt = z.iso.date();

const minValue = new Decimal("0.01");
const maxValue = new Decimal("99999999.99");

const amount = z.string().check((ctx) => {
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
});

const uuid = z.string().trim().uuid();

export const createExpenseSchema = z.object({
  title: z.string().max(255).trim().nonempty(),
  occurredAt,
  amount,
  status: z.number().int().positive(),
  description: z.string().trim().nonempty().optional(),
  walletId: uuid.optional(),
  tagIds: z.array(uuid).optional(),
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
