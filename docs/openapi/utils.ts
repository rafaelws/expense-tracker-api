import { schema } from "./schema";

export const json = (schema: unknown) => ({
  content: { "application/json": { schema: schema } },
});

export const response = (description: string, schema?: unknown) => {
  const response = { description };
  if (!schema) return response;
  return { ...response, ...json(schema) };
};

export const defaultResponses = (include401 = true) => {
  const responses: Record<number, unknown> = {
    400: response("Bad request (Invalid input parameters)", schema.message),
    500: response("Internal Server Error"),
  };
  if (include401) responses[401] = response("Authentication required");
  return responses;
};

export const body = (schema: unknown) => ({
  required: true,
  ...json(schema),
});
