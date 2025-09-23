import { z } from "zod";

import { publicTagSchema } from "../tags/tag-mapper";
import { EXPENSE_STATUS, type ExpenseEntity } from "./expense-entity";

export const publicExpenseSchema = z.object({
  id: z.uuid().meta({ examples: ["147f8682-e1d6-4cb6-8226-b87709e12f4c"] }),
  title: z.string().meta({ examples: ["Weekly grocery"] }),
  description: z
    .string()
    .optional()
    .nullable()
    .meta({ examples: ["Chicken, vegetables and rice", null] }),
  occurredAt: z.iso.date().meta({ examples: ["2025-12-31"] }),
  amount: z.string().meta({
    examples: ["150.50"],
    minLength: 4,
    maxLength: 11,
    description: `Range: 0.01 - 99999999.99`,
  }),
  status: z.enum(EXPENSE_STATUS).meta({
    description: "Status of the expense. 1=PAID, 2=PENDING",
    examples: [1, 2],
  }),
  walletId: z
    .uuid()
    .optional()
    .nullable()
    .meta({ examples: ["e8434b44-5e82-4fb9-896e-67337eae2c6b"] }),
  tagIds: z
    .array(z.uuid())
    .optional()
    .meta({
      examples: ["f210f03f-fdac-44d2-b98b-6e5a5805cef3"],
    }),
  get tags() {
    return z.array(publicTagSchema).optional();
  },
});

export type PublicExpense = z.infer<typeof publicExpenseSchema>;

export const toPublicExpense = (entity: ExpenseEntity): PublicExpense =>
  z.parse(publicExpenseSchema, entity);
