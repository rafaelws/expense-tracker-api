import { schema } from "../schema";
import { body, defaultResponses, response } from "../utils";

const postAuth = {
  security: [],
  operationId: "authenticateUser",
  summary: "Authenticate user",
  requestBody: body(schema.users.authenticate),
  responses: {
    200: response("OK", schema.users.jwt),
    401: response("Invalid e-mail or password."),
    ...defaultResponses(false),
  },
  tags: ["users"],
};

const postCreateUsers = {
  security: [],
  operationId: "createUser",
  summary: "Create user",
  requestBody: body(schema.users.create),
  responses: {
    201: response("Created", schema.users.jwt),
    ...defaultResponses(false),
  },
  tags: ["users"],
};

export const userPaths = {
  "/auth": { post: postAuth },
  "/users": { post: postCreateUsers },
};
