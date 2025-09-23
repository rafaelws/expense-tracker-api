import { z } from "zod";
import { InvalidParameterError } from "@/lib/errors";
import { getAmount } from "./amount";
import { EXPENSE_STATUS } from "./expense-entity";

const occurredAt = z.iso.date().meta({ examples: ["2025-12-31"] });

const amount = z
  // .number()
  // .positive()
  // .or(z.string())
  .string()
  .check((ctx) => {
    try {
      getAmount(ctx.value);
    } catch (e) {
      let message = "Could not get amount";
      if (e instanceof InvalidParameterError) {
        message = e.details ?? message;
      }
      ctx.issues.push({
        message,
        code: "custom",
        input: ctx.value,
      });
      return;
    }
  })
  .meta({
    examples: ["150.50", "0.2", "1", "1.00", "50", "50.0"],
    description: `Range: 0.01 - 99999999.99`,
  });

export const createExpenseSchema = z.object({
  title: z
    .string()
    .max(255)
    .regex(/^(?!\s*$).+/, { error: "Not allowed: Empty spaces only" })
    .trim()
    .nonempty()
    .meta({ examples: ["Weekly grocery"] }),
  description: z
    .string()
    .trim()
    .nonempty()
    .optional()
    .meta({ examples: ["Chicken, vegetables and rice"] }),
  occurredAt,
  amount,
  status: z
    .enum(EXPENSE_STATUS)
    .meta({ description: "1=PAID, 2=PENDING", examples: [1] }),
  walletId: z
    .uuid()
    .optional()
    .meta({ examples: ["e8434b44-5e82-4fb9-896e-67337eae2c6b"] }),
  tagIds: z
    .array(z.uuid())
    .optional()
    .meta({
      examples: ["f210f03f-fdac-44d2-b98b-6e5a5805cef3"],
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
