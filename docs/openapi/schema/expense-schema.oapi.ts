import { z } from "zod";

import { publicExpenseSchema } from "@/features/expenses/expense-mapper";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/features/expenses/expense-schema";
import { publicWalletSchema } from "@/features/wallets/wallet-mapper";

const publicGroupedListSchema = z.array(
  z.object({
    wallet: publicWalletSchema.nullable(),
    expenses: z.array(publicExpenseSchema),
  }),
);

const baseExpenseResponse = publicExpenseSchema.omit({ tags: true });

const latestExpenseSchema = publicExpenseSchema.omit({
  tags: true,
  tagIds: true,
});

export const expenseSchemas = {
  Expense: publicExpenseSchema,
  ExpenseResponse: baseExpenseResponse,
  CreateExpenseRequest: createExpenseSchema,
  // CreateExpenseResponse: baseExpenseResponse,
  UpdateExpenseRequest: updateExpenseSchema,
  // UpdateExpenseResponse: baseExpenseResponse,
  GroupedExpensesResponse: publicGroupedListSchema,
  ListExpensesResponse: z.array(latestExpenseSchema),
};
