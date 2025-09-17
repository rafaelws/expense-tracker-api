import { z } from "zod";

import type { TagEntity } from "./tag-entity";

export const publicTagSchema = z.object({
  id: z.uuid().meta({ example: "f210f03f-fdac-44d2-b98b-6e5a5805cef3" }),
  name: z.string().meta({ example: "Food" }),
  fgColor: z.string().optional().nullable().meta({ example: "#48484e" }),
  bgColor: z
    .string()
    .optional()
    .nullable()
    .meta({ example: "rgba(255,255,255,0.82)" }),
});

export type PublicTag = z.infer<typeof publicTagSchema>;

export const toPublicTag = (entity: TagEntity): PublicTag =>
  z.parse(publicTagSchema, entity);
