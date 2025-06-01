import request from "supertest";
import {
  createIsolatedTestUser,
  createTag,
  createTestUser,
  removeTestUser,
  TestUser,
} from "tests/test-utils";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";

import { TagRepository } from "@/features/tags/tag-repository";
import { app } from "@/http/server";
import { uuid } from "@/lib/uuid";

const resourcePath = "/tags";

describe(`DELETE ${resourcePath}/:id`, () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(async () => {
    await removeTestUser(user.id);
  });

  it("(500) should fail when an error happens", async () => {
    const resource = await createTag(user.id);

    const failMock = vi
      .spyOn(TagRepository.prototype, "remove")
      .mockRejectedValue(new Error());

    onTestFinished(() => {
      failMock.mockRestore();
    });

    await request(app)
      .delete(`${resourcePath}/${resource.id}`)
      .auth(user.token, { type: "bearer" })
      .expect(500);
  });

  it("(401) should be authenticated", async () => {
    const resource = await createTag(user.id);
    await request(app).delete(`${resourcePath}/${resource.id}`).expect(401);
  });

  it("(204) should remove", async () => {
    const resource = await createTag(user.id);
    await request(app)
      .delete(`${resourcePath}/${resource.id}`)
      .auth(user.token, { type: "bearer" })
      .expect(204);
  });

  it("(404) should not remove with an invalid id", async () => {
    const id = uuid();
    const { body } = await request(app)
      .delete(`${resourcePath}/${id}`)
      .auth(user.token, { type: "bearer" })
      .expect(404);
    expect(body.message).toMatch(/^tag#[\w-]+ not found$/i);
  });

  it("(404) should not delete a resource that belongs to a different user", async () => {
    const user2 = await createIsolatedTestUser();
    const resource = await createTag(user.id);

    const { body } = await request(app)
      .delete(`${resourcePath}/${resource.id}`)
      .auth(user2.token, { type: "bearer" })
      .expect(404);

    expect(body?.message).toMatch(/^tag#[\w-]+ not found$/i);
  });
});
