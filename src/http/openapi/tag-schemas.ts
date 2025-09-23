import z from "zod";
import { publicTagSchema } from "@/features/tags/tag-mapper";
import { createTagSchema, updateTagSchema } from "@/features/tags/tag-schema";
import type { SchemaRegistry } from "./schema-types";

export const tagSchemas: SchemaRegistry = {
  one: {
    id: "Tag",
    $ref: "Tag#",
    zodSchema: publicTagSchema,
  },
  many: {
    id: "TagList",
    $ref: "TagList#",
    zodSchema: z.object({ result: z.array(publicTagSchema) }),
  },
  create: {
    id: "CreateTag",
    $ref: "CreateTag#",
    zodSchema: createTagSchema,
  },
  update: {
    id: "UpdateTag",
    $ref: "UpdateTag#",
    zodSchema: updateTagSchema,
  },
} as const;
