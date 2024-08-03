import request from "supertest";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";

import { setupTest } from "@/infra/common/test-utils";
import { DatabaseUserRepo } from "@/infra/db/repos";
import { app } from "@/infra/http/app";

describe("POST /auth", () => {
  const { up, down, createUser } = setupTest();

  beforeAll(() => up());
  afterAll(async () => await down());

  it("(500) should fail when an error happens", async () => {
    const { email, password } = await createUser();

    const message = "Simulated Error";
    const failMock = vi
      .spyOn(DatabaseUserRepo.prototype, "findByEmail")
      .mockRejectedValue(new Error(message));

    onTestFinished(() => {
      failMock.mockRestore();
    });

    const { body } = await request(app)
      .post("/auth")
      .send({
        email,
        password,
      })
      .expect(500);

    expect(body.message).toBe(message);
  });

  it("(200) should authenticate with valid credentials", async () => {
    const { email, password } = await createUser();
    const { body } = await request(app)
      .post("/auth")
      .send({ email, password })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(body).toHaveProperty("token");
  });

  it("(401) should return error for invalid credentials #1", async () => {
    const { email } = await createUser();
    const userData = {
      email: email,
      password: "invalid password",
    };

    const { body } = await request(app)
      .post("/auth")
      .send(userData)
      .expect("Content-Type", /json/)
      .expect(401);

    expect(body).toHaveProperty("message");
    expect(body?.message).eq("Invalid e-mail or password.");
  });

  it("(401) should return error for invalid credentials #2", async () => {
    const userData = {
      email: "user-does-not-exist@example.com",
      password: "password123",
    };

    const { body } = await request(app)
      .post("/auth")
      .send(userData)
      .expect("Content-Type", /json/)
      .expect(401);

    expect(body).toHaveProperty("message");
    expect(body?.message).includes("Invalid e-mail or password.");
  });

  it("(400) should return error for invalid email format", async () => {
    const invalidUserData = {
      email: "invalid-email",
      password: "password123",
    };

    const { body } = await request(app)
      .post("/auth")
      .send(invalidUserData)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(body).toHaveProperty("message");
    expect(body.message).includes("email");
  });

  it("(400) should return error for short password", async () => {
    const invalidUserData = {
      email: "test@example.com",
      password: "short",
    };

    const { body } = await request(app)
      .post("/auth")
      .send(invalidUserData)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(body).toHaveProperty("message");
    expect(body.message).includes("password");
  });
});
