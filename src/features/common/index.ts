export * from "./BigNumber";
export * from "./PasswordHasher";

export const isEmptyString = (target?: string) => {
  if (!target) return false;
  return target.trim().length <= 0;
};
