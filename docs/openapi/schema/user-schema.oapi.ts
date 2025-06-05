import { z } from "zod/v4";

import {
  authenticateUserSchema,
  createUserSchema,
} from "@/features/users/user-schema";

export const userSchemas = {
  CreateUserRequest: createUserSchema,
  AuthenticateUserRequest: authenticateUserSchema,
  TokenResponse: z.object({ token: z.jwt() }),
};
