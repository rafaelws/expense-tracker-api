import { z } from "zod/v4";

import { expenseSchemas } from "./expenses";

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

export const schemas = {
  BadRequestMessage: z.toJSONSchema(z.object({ message: z.string() })),
  ...expenseSchemas,
};

export const schemaRef = (name: keyof typeof schemas) =>
  `#/components/schemas/${name}`;
