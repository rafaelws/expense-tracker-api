import { z, ZodArray, ZodObject } from "zod/v4";

import { expenseSchemas } from "./expenses";
import { tagSchemas } from "./tag";
import { userSchemas } from "./users";
import { walletSchemas } from "./wallet";

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
