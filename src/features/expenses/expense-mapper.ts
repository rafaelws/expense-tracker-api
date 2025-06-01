import { pick } from "@/lib/util";

import { PublicTag, toPublicTag } from "../tags/tag-mapper";
import { ExpenseEntity } from "./expense-entity";

export type PublicExpense = {
  id: string;
  title: string;
  description?: string;
  occurredAt: string;
  amount: string;
  status: number;
  walletId?: string;
  tags?: PublicTag[];
  tagIds?: string[];
  // wallet?: PublicWallet;
};

export const toPublicExpense = (entity: ExpenseEntity): PublicExpense => {
  const withTags = entity.tags
    ? { ...entity, tags: entity.tags.map(toPublicTag) }
    : entity;

  return pick(withTags, [
    "id",
    "title",
    "description",
    "occurredAt",
    "amount",
    "status",
    "tags",
    "walletId",
    "tagIds",
    // "wallet",
  ]);
};
