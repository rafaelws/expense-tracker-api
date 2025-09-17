import { type ZodObject, type ZodRawShape, z } from "zod";

import { ValidationError } from "@/lib/errors";

export function validate<T extends ZodRawShape>(
  input: unknown,
  schema: ZodObject<T>,
): z.infer<typeof schema> {
  const { data, error } = schema.safeParse(input);
  if (error) {
    throw new ValidationError(z.prettifyError(error));
  } else {
    return data as z.infer<typeof schema>;
  }
}
