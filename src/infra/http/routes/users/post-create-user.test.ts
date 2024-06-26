import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "@/infra/http/app";

describe("POST /users", () => {
  it("(201) should create a new user with valid data", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
      passwordConfirmation: "password123",
    };

    const response = await request(app)
      .post("/users")
      .send(userData)
      .expect("Content-Type", /json/)
      .expect(201);

    expect(response.body).toHaveProperty("token");
  });

  it("(400) should not create user: when password mismatch", async () => {
    const invalidUserData = {
      email: "valid@email.com",
      password: "short",
      passwordConfirmation: "different-password",
    };

    const response = await request(app)
      .post("/users")
      .send(invalidUserData)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).includes("password");
  });

  it("(400) should not create user: on invalid e-mail", async () => {
    const invalidUserData = {
      email: "blue ble ebl",
      password: "different-password",
      passwordConfirmation: "different-password",
    };

    const response = await request(app)
      .post("/users")
      .send(invalidUserData)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).includes("email");
  });

  it("(400) should not create user: if user already exists", async () => {
    const duplicateUser = {
      email: "existing-user@example.com",
      password: "newpassword",
      passwordConfirmation: "newpassword",
    };

    // FIXME setup database state instead of doing this
    await request(app)
      .post("/users")
      .send(duplicateUser)
      .expect("Content-Type", /json/)
      .expect(201);

    const response = await request(app)
      .post("/users")
      .send(duplicateUser)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).includes("duplicate");
  });
});
