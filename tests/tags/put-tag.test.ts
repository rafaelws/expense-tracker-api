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
import { TagRepository } from "@/features/tags/tag-repository";
import type { UpdateTagDTO } from "@/features/tags/tag-schema";

const resourcePath = "/tags";

describe(`PUT ${resourcePath}/:id`, () => {
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
    const resource = await createTag(user.id);

    const failMock = vi
      .spyOn(TagRepository.prototype, "update")
      .mockRejectedValue(new Error());

    onTestFinished(() => {
      failMock.mockRestore();
    });

    await request(app)
      .put(`${resourcePath}/${resource.id}`)
      .send({ name: "Gas", bgColor: "orange", fgColor: "white" })
      .auth(user.token, { type: "bearer" })
      .expect(500);
  });

  it("(401) should be authenticated", async () => {
    const resource = await createTag(user.id);
    await request(app)
      .put(`${resourcePath}/${resource.id}`)
      .send({ fgColor: "blue" })
      .expect(401);
  });

  it.each([
    { name: "Gas" },
    { fgColor: "cyan" },
    { bgColor: "#FFFFFF" },
    { name: "Taxes", fgColor: "black", bgColor: "white" },
    { fgColor: "white", bgColor: "black" },
    { name: "Utilities", fgColor: "pink" },
    { name: "Gym", bgColor: "magenta" },
  ])("(200) should update a valid resource %o", async (update) => {
    const resource = await createTag(user.id, {
      name: "Groceries",
      // fgColor: "#FFF",
      // bgColor: "rgb(0,0,0)",
    });

    const { body } = await request(app)
      .put(`${resourcePath}/${resource.id}`)
      .auth(user.token, { type: "bearer" })
      .send(update)
      .expect(200);

    expect(body?.id).toBe(resource.id);
    (["name", "fgColor", "bgColor"] as const).forEach((key) => {
      if (update[key]) expect(body[key]).toBe(update[key]);
    });
  });

  const validationCases: UpdateTagDTO[] = [
    { name: "" },
    { name: "             " },
    { name: "Internet", fgColor: "" },
    { name: "Rent", bgColor: "" },
    { name: "Health Insurance", fgColor: "", bgColor: "" },
    { fgColor: "", bgColor: "   " },
    { fgColor: "       ", bgColor: "" },
    { name: "      ", fgColor: "       ", bgColor: "        " },
  ];

  it.each([{}, ...validationCases])(
    "(400) should not update with invalid data %o",
    async (update) => {
      const resource = await createTag(user.id, { name: "Subscriptions" });
      await request(app)
        .put(`${resourcePath}/${resource.id}`)
        .auth(user.token, { type: "bearer" })
        .send(update)
        .expect(400);
    },
  );

  it("(404) should not update a resource that belongs to a different user", async () => {
    const user2 = await createIsolatedTestUser();
    const resource = await createTag(user.id);

    await request(app)
      .put(`${resourcePath}/${resource.id}`)
      .auth(user2.token, { type: "bearer" })
      .send({ fgColor: "red" })
      .expect(404);
  });
});
