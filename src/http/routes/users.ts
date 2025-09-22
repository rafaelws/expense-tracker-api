import type { FastifyPluginAsync } from "fastify";
import { UserRepository } from "@/features/users/user-repository";
import type {
  AuthenticateUserDTO,
  CreateUserDTO,
} from "@/features/users/user-schema";
import { UserService } from "@/features/users/user-service";
import { ValidationError } from "@/lib/errors";
import { jwt } from "../lib/jwt";
import { response, responses } from "../lib/openapi/schema-helper";
import { schemaRegistry } from "../lib/openapi/schema-registry";

const userService = new UserService(new UserRepository());

const usersRoute: FastifyPluginAsync = async (router) => {
  router.post<{
    Body: CreateUserDTO;
  }>(
    "/users",
    {
      schema: {
        security: [],
        operationId: "createUser",
        summary: "Create user",
        tags: ["users"],
        body: { $ref: schemaRegistry.users.create.$ref },
        response: {
          201: response(201, schemaRegistry.users.token.$ref),
          ...responses(400, 500),
        },
      },
    },
    async (req, reply) => {
      if (req.body.password !== req.body.passwordConfirmation) {
        throw new ValidationError(
          "Password and Password Confirmation mismatch",
        );
      }
      const result = await userService.createUser(req.body);
      if (result === null) {
        return reply.code(400).send({ message: "Invalid e-mail or password." });
      }
      return reply.code(201).send({ token: jwt.sign(result.id) });
    },
  );

  router.post<{
    Body: AuthenticateUserDTO;
  }>(
    "/auth",
    {
      schema: {
        security: [],
        operationId: "authenticateUser",
        summary: "Authenticate user",
        tags: ["users"],
        body: { $ref: schemaRegistry.users.auth.$ref },
        response: {
          200: response(200, schemaRegistry.users.token.$ref),
          401: response(401, schemaRegistry.commons.message.$ref),
          ...responses(400, 500),
        },
      },
    },
    async (req, reply) => {
      const result = await userService.authenticateUser(req.body);
      if (result === null) {
        return reply.code(401).send({ message: "Invalid e-mail or password." });
      }
      return reply.code(200).send({ token: jwt.sign(result.id) });
    },
  );
};

export default usersRoute;
