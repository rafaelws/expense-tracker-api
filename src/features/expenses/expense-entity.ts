import { removeUndefined } from "@/lib/util";

type Expense = {
  id: string;
  amount: string;
  status: number;
  title: string;
  description?: string;
};

export type ExpenseEntity = Expense & {
  occuredAt: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type ExpenseDb = Expense & {
  occured_at: Date;
  created_at: Date;
  updated_at: Date;
  user_id: string;
};

export const toExpenseEntity = ({
  occured_at,
  created_at,
  updated_at,
  user_id,
  ...expense
}: ExpenseDb): ExpenseEntity => ({
  occuredAt: occured_at,
  createdAt: created_at,
  updatedAt: updated_at,
  userId: user_id,
  ...expense,
});

export const toExpenseDb = ({
  occuredAt,
  createdAt,
  updatedAt,
  userId,
  ...expense
}: ExpenseEntity): ExpenseDb => ({
  occured_at: occuredAt,
  created_at: createdAt,
  updated_at: updatedAt,
  user_id: userId,
  ...expense,
});

export type UpdatableExpense = Omit<
  ExpenseEntity,
  "id" | "userId" | "createdAt"
>;

export const toUpdatebleExpenseDb = ({
  amount,
  status,
  title,
  description,
  occuredAt,
  updatedAt,
}: UpdatableExpense): Partial<ExpenseDb> =>
  removeUndefined({
    occured_at: occuredAt,
    updated_at: updatedAt,
    amount,
    status,
    title,
    description,
  });
