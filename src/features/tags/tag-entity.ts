import type { tagsTable } from "@/db/schema";
import { removeUndefined } from "@/lib/util";

export type TagEntity = typeof tagsTable.$inferInsert;

export const toUpdatableTag = ({
  name,
  fgColor,
  bgColor,
  updatedAt,
}: Partial<TagEntity>): Partial<TagEntity> =>
  removeUndefined({ name, fgColor, bgColor, updatedAt });
