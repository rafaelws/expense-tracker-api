import type { Server } from "node:http";
import request from "supertest";
import { getTestServer } from "tests/http-utils";
import {
  createIsolatedTestUser,
  createTag,
  createTestUser,
  removeTestUser,
  type TestUser,
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
import type { PublicTag } from "@/features/tags/tag-mapper";
import { TagRepository } from "@/features/tags/tag-repository";

const resourcePath = "/tags";

describe(`GET ${resourcePath}`, () => {
  let app: Server;
  let user: TestUser;

  beforeAll(async () => {
    app = await getTestServer();
    user = await createTestUser();
  });

  afterAll(async () => {
    await removeTestUser(user.id);
  });

  it("(500) should fail when an error happens", async () => {
    const failMock = vi
      .spyOn(TagRepository.prototype, "allTags")
      .mockRejectedValue(new Error());

    onTestFinished(() => {
      failMock.mockRestore();
    });

    await request(app)
      .get(resourcePath)
      .auth(user.token, { type: "bearer" })
      .expect(500);
  });

  it("(401) should be authenticated", async () => {
    await request(app).get(resourcePath).expect(401);
  });

  it("(200) should not get a resource that belongs to a different user", async () => {
    const [user2] = await Promise.all([
      createIsolatedTestUser(),
      createTag(user.id),
    ]);

    const { body } = await request(app)
      .get(resourcePath)
      .auth(user2.token, { type: "bearer" })
      .expect(200);

    expect(body.result).toBeDefined();
    expect(body.result.length).toBe(0);
  });

  it("(200) should get all tags from a given user", async () => {
    const tags = await Promise.all([
      createTag(user.id, { name: "Food" }),
      createTag(user.id, { name: "Utilities" }),
      createTag(user.id, { name: "Emergency" }),
    ]);

    const { body } = await request(app)
      .get(resourcePath)
      .auth(user.token, { type: "bearer" })
      .expect(200);

    expect(body.result).toBeDefined();
    expect(body.result.length).toBeDefined();

    const response = body.result as PublicTag[];
    expect(response.length).toBe(3);

    const ids = response.map((tag) => tag.id);
    expect(ids).include(tags[0].id);
    expect(ids).include(tags[1].id);
    expect(ids).include(tags[2].id);
  });
});
