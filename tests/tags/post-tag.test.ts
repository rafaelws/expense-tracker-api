import request from "supertest";
import { createTestUser, removeTestUser, TestUser } from "tests/test-utils";
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
import { CreateTagDTO } from "@/features/tags/tag-schema";
import { app } from "@/http/server";

const resourcePath = "/tags";

describe(`POST ${resourcePath}`, () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(async () => {
    await removeTestUser(user.id);
  });

  it("(500) should fail when an error happens", async () => {
    const resource: CreateTagDTO = {
      name: "Groceries",
      bgColor: "red",
      fgColor: "white",
    };

    const failMock = vi
      .spyOn(TagRepository.prototype, "create")
      .mockRejectedValue(new Error());

    onTestFinished(() => {
      failMock.mockRestore();
    });

    const result = await request(app)
      .post(resourcePath)
      .auth(user.token, { type: "bearer" })
      .send(resource)
      .expect(500);

    expect(result.text).toMatch(/Internal Server Error/i);
  });

  it("(401) should be authenticated", async () => {
    const resource: CreateTagDTO = {
      name: "Utilities",
      bgColor: "black",
      fgColor: "white",
    };
    await request(app).post(resourcePath).send(resource).expect(401);
  });

  it("(201) should create a valid resource", async () => {
    const resource: CreateTagDTO = {
      name: "Taxes",
      fgColor: "rgb(255,255,0)",
    };

    const { body } = await request(app)
      .post(resourcePath)
      .auth(user.token, { type: "bearer" })
      .send(resource)
      .expect(201);

    expect(body).toHaveProperty("id");
    expect(body?.name).toBe(resource.name);
    expect(body?.fgColor).toBe(resource.fgColor);
  });

  const validationCases: CreateTagDTO[] = [
    { name: "" },
    { name: "             " },
    { name: "Groceries", fgColor: "" },
    { name: "Taxes", bgColor: "" },
    { name: "Pharmacy", fgColor: "", bgColor: "" },
  ];

  it.each([{}, ...validationCases])(
    "(400) should not create when %s",
    async (data) => {
      await request(app)
        .post(resourcePath)
        .auth(user.token, { type: "bearer" })
        .send(data)
        .expect("Content-Type", /json/)
        .expect(400);
    },
  );
});
