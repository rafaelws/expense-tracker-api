import { z } from "zod/v4";

import { publicTagSchema } from "../tags/tag-mapper";
import { EXPENSE_STATUS, ExpenseEntity } from "./expense-entity";

export const publicExpenseSchema = z.object({
  id: z.uuid().meta({ example: "147f8682-e1d6-4cb6-8226-b87709e12f4c" }),
  title: z.string().meta({ example: "Weekly grocery" }),
  description: z
    .string()
    .optional()
    .nullable()
    .meta({ examples: ["Chicken, vegetables and rice", null] }),
  occurredAt: z.iso.date().meta({ example: "2025-12-31" }),
  amount: z.string().meta({
    example: "150.50",
    minLength: 4,
    maxLength: 11,
    description: `Range: 0.01 - 99999999.99`,
  }),
  status: z
    .enum(EXPENSE_STATUS)
    .meta({ description: "1=PAID, 2=PENDING", example: 1 }),
  walletId: z
    .uuid()
    .optional()
    .nullable()
    .meta({ example: "e8434b44-5e82-4fb9-896e-67337eae2c6b" }),
  tagIds: z
    .array(z.uuid())
    .optional()
    .meta({
      example: ["f210f03f-fdac-44d2-b98b-6e5a5805cef3"],
    }),
  get tags() {
    return z.array(publicTagSchema).optional();
  },
});

export type PublicExpense = z.infer<typeof publicExpenseSchema>;

export const toPublicExpense = (entity: ExpenseEntity): PublicExpense =>
  z.parse(publicExpenseSchema, entity);
