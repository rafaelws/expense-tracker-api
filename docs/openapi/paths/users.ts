import { schemaRef } from "../schema";
import { body, defaultResponses, response } from "../schema/utils";

const postAuth = {
  security: [],
  operationId: "authenticateUser",
  summary: "Authenticate user",
  requestBody: body(schemaRef("AuthenticateUserRequest")),
  responses: {
    200: response("OK", schemaRef("TokenResponse")),
    401: response("Invalid e-mail or password."),
    ...defaultResponses(false),
  },
  tags: ["users"],
};

const postCreateUsers = {
  security: [],
  operationId: "createUser",
  summary: "Create user",
  requestBody: body(schemaRef("CreateUserRequest")),
  responses: {
    201: response("Created", schemaRef("TokenResponse")),
    ...defaultResponses(false),
  },
  tags: ["users"],
};

export const userPaths = {
  "/auth": { post: postAuth },
  "/users": { post: postCreateUsers },
};
