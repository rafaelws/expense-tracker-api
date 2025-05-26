import { removeUndefined } from "@/lib/util";

type Expense = {
  id: string;
  amount: string;
  status: number;
  title: string;
  description?: string;
};

export type ExpenseEntity = Expense & {
  occurredAt: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type ExpenseDb = Expense & {
  occurred_at: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
};

export const toExpenseEntity = ({
  occurred_at,
  created_at,
  updated_at,
  user_id,
  ...expense
}: ExpenseDb): ExpenseEntity => ({
  occurredAt: occurred_at,
  createdAt: created_at,
  updatedAt: updated_at,
  userId: user_id,
  ...expense,
});

export const toExpenseDb = ({
  occurredAt,
  createdAt,
  updatedAt,
  userId,
  ...expense
}: ExpenseEntity): ExpenseDb => ({
  occurred_at: occurredAt,
  created_at: createdAt,
  updated_at: updatedAt,
  user_id: userId,
  ...expense,
});

export const toUpdatebleExpenseDb = (
  entity: Partial<ExpenseEntity>,
): Partial<ExpenseDb> => {
  const partial: Partial<ExpenseDb> = {
    occurred_at: entity.occurredAt,
    updated_at: entity.updatedAt,
    amount: entity.amount,
    status: entity.status,
    title: entity.title,
    description: entity.description,
  };
  return removeUndefined(partial);
};
