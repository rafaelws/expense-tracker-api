import { removeUndefined } from "@/lib/util";

export type WalletEntity = {
  id: string;
  name: string;
  fgColor?: string;
  bgColor?: string;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type WalletDb = {
  id: string;
  name: string;
  fg_color?: string;
  bg_color?: string;
  sort_order?: number;
  created_at: Date;
  updated_at: Date;
  user_id: string;
};

export const toWalletEntity = (db: WalletDb): WalletEntity => ({
  id: db.id,
  name: db.name,
  fgColor: db.fg_color,
  bgColor: db.bg_color,
  sortOrder: db.sort_order,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
  userId: db.user_id,
});

export const toWalletDb = (entity: WalletEntity): WalletDb => ({
  id: entity.id,
  name: entity.name,
  fg_color: entity.fgColor,
  bg_color: entity.bgColor,
  sort_order: entity.sortOrder,
  created_at: entity.createdAt,
  updated_at: entity.updatedAt,
  user_id: entity.userId,
});

export const toUpdatableWalletDb = (
  entity: Partial<WalletEntity>,
): Partial<WalletDb> => {
  const partial: Partial<WalletDb> = {
    name: entity.name,
    fg_color: entity.fgColor,
    bg_color: entity.bgColor,
    sort_order: entity.sortOrder,
    updated_at: entity.updatedAt,
  };
  return removeUndefined(partial);
};
