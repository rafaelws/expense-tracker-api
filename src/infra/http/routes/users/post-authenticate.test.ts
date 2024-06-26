import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "@/infra/http/app";

describe("POST /auth", () => {
  it("(200) should authenticate with valid credentials", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
    };

    // FIXME setup database state instead of doing this
    await request(app)
      .post("/users")
      .send({ ...userData, passwordConfirmation: userData.password })
      .expect("Content-Type", /json/)
      .expect(201);

    const response = await request(app)
      .post("/auth")
      .send(userData)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toHaveProperty("token");
  });

  it("(400) should return error for invalid email format", async () => {
    const invalidUserData = {
      email: "invalid-email",
      password: "password123",
    };

    const response = await request(app)
      .post("/auth")
      .send(invalidUserData)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).includes("email");
  });

  it("(400) should return error for short password", async () => {
    const invalidUserData = {
      email: "test@example.com",
      password: "short",
    };

    const response = await request(app)
      .post("/auth")
      .send(invalidUserData)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).includes("password");
  });

  it("(401) should return error for invalid credentials", async () => {
    const userData = {
      email: "bluedabadee@example.com",
      password: "password123",
    };

    const response = await request(app)
      .post("/auth")
      .send(userData)
      .expect("Content-Type", /json/)
      .expect(401);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).includes("invalid e-mail or password");
  });
});
