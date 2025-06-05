import { Router } from "express";

import { createTagSchema, updateTagSchema } from "@/features/tags/tag-schema";
import { ensureAuthenticated } from "@/http/middlewares/ensure-authenticated-middleware";
import { ensureBodySchema } from "@/http/middlewares/ensure-schema-middleware";

import { deleteTag, getTags, postTag, putTag } from "./tag-http-handlers";

export const tagsRouter = Router();

tagsRouter
  .route("/tags")
  .all(ensureAuthenticated)
  .get(getTags)
  .post(ensureBodySchema(createTagSchema), postTag);

tagsRouter
  .route("/tags/:id")
  .all(ensureAuthenticated)
  .put(ensureBodySchema(updateTagSchema), putTag)
  .delete(deleteTag);
