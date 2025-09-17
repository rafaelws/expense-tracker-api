import { z } from "zod";

const email = z.email().meta({ example: "example@email.com" });
const password = z.string().min(6).max(20).meta({ example: "min 6 max 20" });

export const createUserSchema = z
  .object({
    email,
    password,
    passwordConfirmation: password,
  })
  .refine((input) => input.password === input.passwordConfirmation, {
    message: "password and password confirmation mismatch",
    path: ["passwordConfirmation"],
  });

export type CreateUserDTO = z.infer<typeof createUserSchema>;

export const authenticateUserSchema = z.object({
  email,
  password,
});

export type AuthenticateUserDTO = z.infer<typeof authenticateUserSchema>;

export type ExposableUser = {
  id: string;
  email: string;
};
