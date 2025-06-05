import { z } from "zod/v4";

import { publicExpenseSchema } from "@/features/expenses/expense-mapper";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/features/expenses/expense-schema";
import { publicWalletSchema } from "@/features/wallets/wallet-mapper";

const publicExpenseListSchema = z.array(
  z.object({
    wallet: publicWalletSchema.optional(),
    expenses: z.array(publicExpenseSchema).optional(),
  }),
);

const baseExpenseResponse = publicExpenseSchema.omit({ tags: true });

export const expenseSchemas = {
  Expense: publicExpenseSchema,
  ExpenseResponse: baseExpenseResponse,
  CreateExpenseRequest: createExpenseSchema,
  // CreateExpenseResponse: baseExpenseResponse,
  UpdateExpenseRequest: updateExpenseSchema,
  // UpdateExpenseResponse: baseExpenseResponse,
  ListExpensesResponse: publicExpenseListSchema,
};
