import { UserRepository } from "@/features/users/user-repository";
import {
  authenticateUserSchema,
  createUserSchema,
} from "@/features/users/user-schema";
import { UserService } from "@/features/users/user-service";
import { jwt } from "@/http/lib/jwt";
import { HttpRequest, reply } from "@/http/lib/types";
import { validate } from "@/http/lib/validate";

const userService = new UserService(new UserRepository());

export async function postUser({ body }: HttpRequest) {
  const dto = validate(body, createUserSchema);
  const result = await userService.createUser(dto);
  if (result === null) {
    return reply(400, { message: "Invalid e-mail or password." });
  }
  return reply(201, { token: jwt.sign(result.id) });
}

export async function postAuthenticate({ body }: HttpRequest) {
  const dto = validate(body, authenticateUserSchema);
  const result = await userService.authenticateUser(dto);
  if (result === null) {
    return reply(401, { message: "Invalid e-mail or password." });
  }
  return reply(200, { token: jwt.sign(result.id) });
}
