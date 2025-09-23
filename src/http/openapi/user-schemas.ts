import z from "zod";
import {
  authenticateUserSchema,
  createUserSchema,
} from "@/features/users/user-schema";
import type { SchemaRegistry } from "./schema-types";

export const userSchemas: SchemaRegistry = {
  auth: {
    id: "AuthUser",
    $ref: "AuthUser#",
    zodSchema: authenticateUserSchema,
  },
  create: {
    id: "CreateUser",
    $ref: "CreateUser#",
    zodSchema: createUserSchema,
  },
  token: {
    id: "JWTToken",
    $ref: "JWTToken#",
    zodSchema: z.object({ token: z.jwt() }),
  },
};
