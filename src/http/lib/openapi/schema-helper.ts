import { schemaRegistry } from "./schema-registry";

const responseSchema = (description: string, $ref?: string) => {
  const res: Record<string, unknown> = {
    "x-response-description": description,
  };
  if ($ref) res.$ref = $ref;
  else res.type = "null";
  return res;
};

// default: 400, 500; optional: 401; common: 404
export const responses = (...codes: number[]) => {
  const responses: Record<number, unknown> = {};
  for (const code of codes) {
    responses[code] = response(code);
  }
  return responses;
};

export const response = (code: number, $ref?: string) => {
  switch (code) {
    case 200:
      return responseSchema("OK", $ref);
    case 201:
      return responseSchema("Created", $ref);
    case 204:
      return responseSchema("No Content");
    case 400:
      return responseSchema("Bad Request", schemaRegistry.commons.message.$ref);
    case 401:
      return responseSchema("Unauthorized");
    case 403:
      return responseSchema("Forbidden");
    case 404:
      return responseSchema("Not Found", schemaRegistry.commons.message.$ref);
    case 500:
      return responseSchema(
        "Internal Server Error",
        schemaRegistry.commons.message.$ref,
      );
  }
};
