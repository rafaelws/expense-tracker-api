import type { expensesTable } from "@/db/schema";
import { removeUndefined } from "@/lib/util";
import type { TagEntity } from "../tags/tag-entity";
import type { WalletEntity } from "../wallets/wallet-entity";

export const EXPENSE_STATUS = {
  PAID: 1,
  PENDING: 2,
} as const;

// export type ExpenseStatus =
//   (typeof EXPENSE_STATUS)[keyof typeof EXPENSE_STATUS];

export type ExpenseEntity = typeof expensesTable.$inferInsert & {
  wallet?: WalletEntity;
  tags?: TagEntity[];
  tagIds?: string[];
};

export const toUpdatableExpense = ({
  occurredAt,
  updatedAt,
  amount,
  status,
  title,
  description,
  walletId,
}: Partial<ExpenseEntity>): Partial<ExpenseEntity> => {
  return removeUndefined({
    occurredAt,
    updatedAt,
    amount,
    status,
    title,
    description,
    walletId,
  });
};
