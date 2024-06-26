import { ZodIssue } from "zod";

const format = (issue: ZodIssue): string => {
  const { path, message } = issue;
  const pathString = path.join(".");

  return pathString ? `${pathString}: ${message}` : message;
};

export const formatZodIssues = (issues: ZodIssue[]): string => {
  if (issues.length) return issues.map(format).join(", ");
  return "";
};
