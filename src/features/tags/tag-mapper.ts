import { pick } from "@/lib/util";

import { TagEntity } from "./tag-entity";

export type PublicTag = {
  id: string;
  name: string;
  fgColor?: string;
  bgColor?: string;
};

export const toPublicTag = (entity: TagEntity): PublicTag =>
  pick(entity, ["id", "name", "fgColor", "bgColor"]);
