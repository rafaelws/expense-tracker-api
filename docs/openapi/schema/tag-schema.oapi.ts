import { z } from "zod";

import { publicTagSchema } from "@/features/tags/tag-mapper";
import { createTagSchema, updateTagSchema } from "@/features/tags/tag-schema";

export const tagSchemas = {
  Tag: publicTagSchema,
  TagList: z.array(publicTagSchema),
  CreateTagRequest: createTagSchema,
  // CreateTagResponse: publicTagSchema,
  UpdateTagRequest: updateTagSchema,
  // UpdateTagResponse: publicTagSchema,
};
