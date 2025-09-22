import type { FastifyPluginAsync } from "fastify";
import { TagRepository } from "@/features/tags/tag-repository";
import { TagService } from "@/features/tags/tag-service";
import { ValidationError } from "@/lib/errors";
import { anyOfKeys } from "@/lib/util";
import { response, responses } from "../lib/openapi/schema-helper";
import {
  type CreateTag,
  type IdParam,
  schemaRegistry,
  type UpdateTag,
} from "../lib/openapi/schema-registry";
import { setAuthHook } from "../middlewares/auth-hook";

const tagService = new TagService(new TagRepository());

const tagsRouter: FastifyPluginAsync = async (router) => {
  setAuthHook(router);

  router.get(
    "/",
    {
      schema: {
        operationId: "getTags",
        summary: "Retrieve tags",
        tags: ["tags"],
        response: {
          200: response(200, schemaRegistry.tags.many.$ref),
          ...responses(401, 500),
        },
      },
    },
    async (req, reply) => {
      const result = await tagService.getTags(req.userId!);
      return reply.code(200).send(result);
    },
  );

  router.post<{
    Body: CreateTag;
  }>(
    "/",
    {
      schema: {
        operationId: "createTag",
        summary: "Create a new tag",
        tags: ["tags"],
        body: { $ref: schemaRegistry.tags.create.id },
        response: {
          200: response(200, schemaRegistry.tags.one.$ref),
          ...responses(400, 401, 500),
        },
      },
    },
    async (req, reply) => {
      const result = await tagService.createTag(req.userId!, req.body);
      return reply.code(201).send(result);
    },
  );

  router.put<{
    Params: IdParam;
    Body: UpdateTag;
  }>(
    "/:id",
    {
      schema: {
        operationId: "updateTag",
        summary: "Updates an existing tag",
        tags: ["tags"],
        params: { $ref: schemaRegistry.commons.idParam.$ref },
        body: { $ref: schemaRegistry.tags.update.$ref },
        response: {
          200: response(200, schemaRegistry.tags.one.$ref),
          ...responses(400, 401, 404, 500),
        },
      },
    },
    async (req, reply) => {
      if (!anyOfKeys(req.body, ["name", "bgColor", "fgColor"])) {
        throw new ValidationError("At least one field should be present");
      }
      const result = await tagService.updateTag(
        req.params.id,
        req.userId!,
        req.body,
      );
      return reply.code(200).send(result);
    },
  );

  router.delete<{ Params: IdParam }>(
    "/:id",
    {
      schema: {
        operationId: "deleteTag",
        summary: "Deletes an existing tag",
        tags: ["tags"],
        params: { $ref: schemaRegistry.commons.idParam.$ref },
        response: responses(204, 400, 401, 404, 500),
      },
    },
    async (req, reply) => {
      await tagService.deleteTag(req.params.id, req.userId!);
      return reply.code(204).send();
    },
  );
};

export default tagsRouter;

export const autoPrefix = "/tags";
