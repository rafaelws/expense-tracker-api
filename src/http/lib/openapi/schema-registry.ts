import z, { type ZodType } from "zod";
import { publicTagSchema } from "@/features/tags/tag-mapper";
import { createTagSchema, updateTagSchema } from "@/features/tags/tag-schema";
import type { ServerLike } from "@/http/server";

type SchemaRegistryUnit = {
  id: string;
  $ref: string;
  zodSchema: ZodType;
};
type SchemaRegistry = Record<string, SchemaRegistryUnit>;

export type CreateTag = z.infer<typeof createTagSchema>;
export type UpdateTag = z.infer<typeof updateTagSchema>;

const tags: SchemaRegistry = {
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

// --

const message = z.object({ message: z.string().nonempty() });
const idParam = z.object({ id: z.uuid().nonempty() });

export type IdParam = z.infer<typeof idParam>;

const global: SchemaRegistry = {
  message: {
    id: "Message",
    $ref: "Message#",
    zodSchema: message,
  },
  idParam: {
    id: "IdParam",
    $ref: "IdParam#",
    zodSchema: idParam,
  },
};

// --

export const schemaRegistry = {
  commons: global,
  tags,
} as const;

export function registerSchemas(fastify: ServerLike) {
  const registry = z.registry<{ id: string }>();
  for (const group of Object.values(schemaRegistry)) {
    for (const unit of Object.values(group)) {
      // TODO will it be enough to zod if there is inner references like in expenses?
      registry.add(unit.zodSchema, { id: unit.id });
    }
  }
  const { schemas } = z.toJSONSchema(registry, {
    // uri: (id) => id,
    // reused: "ref",
    target: "draft-7",
  });
  for (const name of Object.keys(schemas)) {
    if (name === "__shared") continue;
    fastify.addSchema({ ...schemas[name], $id: name });
  }
}
