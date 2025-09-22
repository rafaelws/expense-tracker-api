import { z } from "zod";

const email = z.email().meta({ examples: ["example@email.com"] });
const password = z
  .string()
  .min(6)
  .max(20)
  .meta({ examples: ["not123", "max is 20 chars long"] });

export const createUserSchema = z.object({
  email,
  password,
  passwordConfirmation: password,
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;

export const authenticateUserSchema = z.object({
  email,
  password,
});

export type AuthenticateUserDTO = z.infer<typeof authenticateUserSchema>;

export const exposableUserSchema = z.object({ id: z.uuid(), email: z.email() });

export type ExposableUser = z.infer<typeof exposableUserSchema>;
