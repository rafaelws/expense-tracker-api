import { removeUndefined } from "@/lib/util";

import type { TagEntity } from "../tags/tag-entity";
import type { WalletEntity } from "../wallets/wallet-entity";

export const EXPENSE_STATUS = {
  PAID: 1,
  PENDING: 2,
} as const;

// export type ExpenseStatus =
//   (typeof EXPENSE_STATUS)[keyof typeof EXPENSE_STATUS];

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
  walletId?: string;
  wallet?: WalletEntity;
  tagIds?: string[];
  tags?: TagEntity[];
};

export type ExpenseDb = Expense & {
  occurred_at: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  wallet_id?: string;
};

export const toExpenseEntity = (db: ExpenseDb): ExpenseEntity => {
  const entity: ExpenseEntity = {
    id: db.id,
    amount: db.amount,
    status: db.status,
    title: db.title,
    description: db.description,
    occurredAt: db.occurred_at,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    userId: db.user_id,
    walletId: db.wallet_id,
  };
  return entity;
};

export const toExpenseDb = (entity: ExpenseEntity): ExpenseDb => {
  const expense: ExpenseDb = {
    id: entity.id,
    amount: entity.amount,
    status: entity.status,
    title: entity.title,
    description: entity.description,
    occurred_at: entity.occurredAt,
    created_at: entity.createdAt,
    updated_at: entity.updatedAt,
    user_id: entity.userId,
    wallet_id: entity.walletId,
  };
  return expense;
};

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
    wallet_id: entity.walletId,
  };
  return removeUndefined(partial);
};
