import request from "supertest";
import {
  createUser,
  randomEmail,
  randomPass,
  removeUserByEmail,
} from "tests/test-utils";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { UserService } from "@/features/users/user-service";
import { jwt } from "@/http/lib/jwt";
import { app } from "@/http/server";

describe("POST /users", () => {
  it("(500) should fail when an error happens", async () => {
    const email = randomEmail();
    const password = randomPass();

    const failMock = vi
      .spyOn(UserService.prototype, "createUser")
      .mockRejectedValue(new Error("unexpected error"));

    onTestFinished(async () => {
      failMock.mockRestore();
      await removeUserByEmail(email);
    });

    await request(app)
      .post("/users")
      .send({
        email,
        password,
        passwordConfirmation: password,
      })
      .expect(500);
  });

  it("(201) should create a new user with valid data", async () => {
    const email = randomEmail();
    const password = randomPass();

    onTestFinished(async () => await removeUserByEmail(email));

    const { body } = await request(app)
      .post("/users")
      .send({
        email,
        password,
        passwordConfirmation: password,
      })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(body).toHaveProperty("token");
    expect(jwt.verify(body.token)).toBeDefined();
  });

  it("(400) should not create user: when password mismatch", async () => {
    const invalidUserData = {
      email: "valid@email.com",
      password: "invalid password",
      passwordConfirmation: "1234password",
    };

    const { body } = await request(app)
      .post("/users")
      .send(invalidUserData)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(body).toHaveProperty("message");
    expect(body?.message).toMatch(
      /password and password confirmation mismatch/i,
    );
  });

  it("(400) should not create user: when password is too short", async () => {
    const invalidUserData = {
      email: "valid@email.com",
      password: "short",
      passwordConfirmation: "short",
    };

    const { body } = await request(app)
      .post("/users")
      .send(invalidUserData)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(body).toHaveProperty("message");
    expect(body?.message).toMatch(/expected string to have >6 characters/i);
  });

  it("(400) should not create user: on invalid e-mail", async () => {
    const invalidUserData = {
      email: "invalid email",
      password: "1234password",
      passwordConfirmation: "1234password",
    };

    const { body } = await request(app)
      .post("/users")
      .send(invalidUserData)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(body).toHaveProperty("message");
    expect(body?.message).toMatch(/email/i);
  });

  it("(400) should not create user: if user already exists", async () => {
    const { email, password } = await createUser();

    const { body } = await request(app)
      .post("/users")
      .send({
        email,
        password,
        passwordConfirmation: password,
      })
      .expect("Content-Type", /json/)
      .expect(400);

    expect(body).toHaveProperty("message");
    expect(body?.message).toMatch(/invalid e-mail or password/i);
  });
});
