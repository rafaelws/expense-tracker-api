import z from "zod";
import type { ServerLike } from "@/http/server";
import { expenseSchemas } from "./expense-schema";
import type { SchemaRegistry } from "./schema-types";
import { tagSchemas } from "./tag-schemas";
import { userSchemas } from "./user-schemas";
import { walletSchemas } from "./wallet-schemas";

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
  tags: tagSchemas,
  users: userSchemas,
  wallets: walletSchemas,
  expenses: expenseSchemas,
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
