import { schemaRef, uuidInParams } from "../schema";
import { body, defaultResponses, response } from "../schema/utils";

const postTag = {
  operationId: "createTag",
  summary: "Create a new tag",
  requestBody: body(schemaRef("CreateTagRequest")),
  responses: {
    201: response("Created", schemaRef("Tag")),
    ...defaultResponses(),
  },
  tags: ["tags"],
};

const putTag = {
  operationId: "updateTag",
  summary: "Updates an existing tag",
  parameters: [uuidInParams()],
  requestBody: body(schemaRef("UpdateTagRequest")),
  responses: {
    200: response("OK", schemaRef("Tag")),
    404: response("Resource not found"),
    ...defaultResponses(),
  },
  tags: ["tags"],
};

const deleteTag = {
  operationId: "deleteTag",
  summary: "Deletes an existing tag",
  parameters: [uuidInParams()],
  responses: {
    204: response("No Content"),
    404: response("Resource not found"),
    ...defaultResponses(),
  },
  tags: ["tags"],
};

const getTagsResponses = { ...defaultResponses() };
delete getTagsResponses[400];
getTagsResponses[200] = response("OK", schemaRef("TagList"));

const getTags = {
  operationId: "getTags",
  summary: "Retrieve tags",
  responses: getTagsResponses,
  tags: ["tags"],
};

export const tagPaths = {
  "/tags": { post: postTag, get: getTags },
  "/tags/{id}": { put: putTag, delete: deleteTag },
};
