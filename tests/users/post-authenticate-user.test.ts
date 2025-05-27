import request from "supertest";
import { createIsolatedTestUser } from "tests/test-utils";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { UserRepository } from "@/features/users/user-repository";
import { app } from "@/http/server";

describe("POST /auth", () => {
  const createUser = () => createIsolatedTestUser(true);

  it("(500) should fail when an error happens", async () => {
    const { email, password } = await createUser();

    const failMock = vi
      .spyOn(UserRepository.prototype, "findByEmail")
      .mockRejectedValue(new Error());

    onTestFinished(() => {
      failMock.mockRestore();
    });

    await request(app)
      .post("/auth")
      .send({
        email,
        password,
      })
      .expect(500);
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
    expect(body?.message).toMatch(/invalid e-mail or password/i);
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
    expect(body?.message).toMatch(/invalid e-mail or password/i);
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
    expect(body.message).toMatch(/email/gi);
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
    expect(body.message).toMatch(/password/gi);
  });
});
