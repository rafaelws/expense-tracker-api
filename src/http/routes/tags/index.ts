import { Router } from "express";

import { httpRoute } from "@/http/lib/adapter";

import { deleteTag, getTags, postTag, putTag } from "./tag-http-handlers";

export const tagsRouter = Router();

tagsRouter.route("/tags").get(httpRoute(getTags)).post(httpRoute(postTag));

tagsRouter
  .route("/tags/:id")
  .put(httpRoute(putTag))
  .delete(httpRoute(deleteTag));
