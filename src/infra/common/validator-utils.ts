import zod, { ZodIssue } from "zod";

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
