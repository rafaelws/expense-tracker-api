import { removeUndefined } from "@/lib/util";

export type TagEntity = {
  id: string;
  name: string;
  fgColor?: string;
  bgColor?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type TagDb = {
  id: string;
  name: string;
  fg_color?: string;
  bg_color?: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
};

export const toTagDb = (entity: TagEntity): TagDb => ({
  id: entity.id,
  name: entity.name,
  fg_color: entity.fgColor,
  bg_color: entity.bgColor,
  created_at: entity.createdAt,
  updated_at: entity.updatedAt,
  user_id: entity.userId,
});

export const toTagEntity = (db: TagDb): TagEntity => ({
  id: db.id,
  name: db.name,
  fgColor: db.fg_color,
  bgColor: db.bg_color,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
  userId: db.user_id,
});

export const toUpdatableTagDb = (
  entity: Partial<TagEntity>,
): Partial<TagDb> => {
  const partial: Partial<TagDb> = {
    name: entity.name,
    fg_color: entity.fgColor,
    bg_color: entity.bgColor,
    updated_at: entity.updatedAt,
  };
  return removeUndefined(partial);
};
