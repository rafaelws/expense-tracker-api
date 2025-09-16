import type { walletsTable } from "@/db/schema";
import { removeUndefined } from "@/lib/util";

export type WalletEntity = typeof walletsTable.$inferInsert;

export const toUpdatableWallet = ({
  name,
  fgColor,
  bgColor,
  sortOrder,
  updatedAt,
}: Partial<WalletEntity>): Partial<WalletEntity> => {
  return removeUndefined({ name, fgColor, bgColor, sortOrder, updatedAt });
};
