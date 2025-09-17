import { type ZodArray, type ZodObject, z } from "zod";

import { expenseSchemas } from "./expense-schema.oapi";
import { tagSchemas } from "./tag-schema.oapi";
import { userSchemas } from "./user-schema.oapi";
import { walletSchemas } from "./wallet-schema.oapi";

export const parameters = {
  UuidInParams: {
    in: "path",
    name: "id",
    schema: z.toJSONSchema(z.uuid()),
  },
};

export const uuidInParams = () => ({
  $ref: `#/components/parameters/UuidInParams`,
});

const all: Record<string, ZodObject | ZodArray> = {
  BadRequestMessage: z.object({ message: z.string() }),
  ...userSchemas,
  ...walletSchemas,
  ...tagSchemas,
  ...expenseSchemas,
} as const;

export const schemaRef = (name: keyof typeof all) =>
  `#/components/schemas/${name}`;

const registry = z.registry<{ id: string }>();

for (const key of Object.keys(all)) {
  registry.add(all[key], { id: key });
}

export const schemas = z.toJSONSchema(registry, {
  uri: (id) => schemaRef(id),
}).schemas;
