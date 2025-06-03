import { z } from "zod/v4";

import { publicExpenseSchema } from "@/features/expenses/expense-mapper";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/features/expenses/expense-schema";
import {
  authenticateUserSchema,
  createUserSchema,
} from "@/features/users/user-schema";
import { publicWalletSchema } from "@/features/wallets/wallet-mapper";

const uuidInParams = {
  in: "path",
  name: "id",
  schema: z.toJSONSchema(z.uuid()),
};

const message = z.toJSONSchema(z.object({ message: z.string() }));

const users = {
  create: z.toJSONSchema(createUserSchema),
  authenticate: z.toJSONSchema(authenticateUserSchema),
  jwt: z.toJSONSchema(z.object({ token: z.jwt() })),
};

// --

const publicExpenseListSchema = z
  .array(
    z.object({
      wallet: publicWalletSchema.optional(),
      expenses: z.array(publicExpenseSchema).optional(),
    }),
  )
  .optional();

const expenses = {
  create: z.toJSONSchema(createExpenseSchema),
  update: z.toJSONSchema(updateExpenseSchema),
  public: z.toJSONSchema(publicExpenseSchema),
  list: z.toJSONSchema(publicExpenseListSchema),
};

export const schema = {
  message,
  uuidInParams,
  users,
  expenses,
};
