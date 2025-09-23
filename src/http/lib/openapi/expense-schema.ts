import z from "zod";
import { publicExpenseSchema } from "@/features/expenses/expense-mapper";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/features/expenses/expense-schema";
import { publicWalletSchema } from "@/features/wallets/wallet-mapper";
import type { SchemaRegistry } from "./schema-types";

const groupedExpensesSchema = z.array(
  z.object({
    wallet: publicWalletSchema.nullable(),
    expenses: z.array(publicExpenseSchema),
  }),
);

export const expenseSchemas: SchemaRegistry = {
  one: {
    id: "Expense",
    $ref: "Expense#",
    zodSchema: publicExpenseSchema.omit({ tags: true }),
  },
  many: {
    id: "ExpenseList",
    $ref: "ExpenseList#",
    zodSchema: z.object({
      result: z.array(publicExpenseSchema.omit({ tags: true, tagIds: true })),
    }),
  },
  manyGrouped: {
    id: "ExpenseGrouped",
    $ref: "ExpenseGrouped#",
    zodSchema: groupedExpensesSchema,
  },
  create: {
    id: "CreateExpense",
    $ref: "CreateExpense#",
    zodSchema: createExpenseSchema,
  },
  update: {
    id: "UpdateExpense",
    $ref: "UpdateExpense#",
    zodSchema: updateExpenseSchema,
  },
} as const;
