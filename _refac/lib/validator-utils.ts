import zod, { ZodIssue, ZodSchema } from "zod";

const uuid = zod.string().uuid();

const format = (issue: ZodIssue): string => {
  const { path, message } = issue;
  const pathString = path.join(".");

  return pathString ? `${pathString}: ${message}` : message;
};

export const formatZodIssues = (issues: ZodIssue[]): string => {
  if (issues.length) return issues.map(format).join(", ");
  return "";
};

export const validateUUID = (id?: string) => {
  return uuid.safeParse(id).success;
};

export function validateSchema<T>(
  schema: ZodSchema,
  target: unknown,
): [string | null, T | null] {
  const { success, data, error } = schema.safeParse(target);

  if (success === false || !data) {
    return [error ? formatZodIssues(error?.issues) : "", null];
  }
  return [null, data as T];
}
