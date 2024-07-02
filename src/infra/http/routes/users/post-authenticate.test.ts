import bcrypt from "bcryptjs";
import postgres from "postgres";
import request from "supertest";
import { v4 as uuid } from "uuid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { cfg } from "@/infra/common";
import { app } from "@/infra/http/app";

describe("POST /auth", async () => {
  let sql: postgres.Sql;

  beforeAll(() => {
    sql = postgres(cfg.databaseUrl, { max: 1 });
  });

  afterAll(() => sql.end());

  async function createUser(): Promise<[string, string, string]> {
    const plainTextPass = uuid().substring(0, 8);
    const password = await bcrypt.hash(plainTextPass, 10);
    const time = new Date();
    const user = {
      id: uuid(),
      email: `${uuid()}@example.com`,
      password,
      created_at: time,
      updated_at: time,
    };
    await sql`INSERT INTO users ${sql(user)}`;
    return [user.id, user.email, plainTextPass];
  }

  async function removeUser(id: string) {
    await sql`DELETE FROM users WHERE id=${id}`;
  }

  it("(200) should authenticate with valid credentials", async () => {
    const [id, email, password] = await createUser();
    const response = await request(app)
      .post("/auth")
      .send({ email, password })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toHaveProperty("token");
    await removeUser(id);
  });

  it("(401) should return error for invalid credentials #1", async () => {
    const [id, email] = await createUser();
    const userData = {
      email: email,
      password: "invalid password",
    };

    const response = await request(app)
      .post("/auth")
      .send(userData)
      .expect("Content-Type", /json/)
      .expect(401);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).eq("Invalid e-mail or password.");
    await removeUser(id);
  });

  it("(401) should return error for invalid credentials #2", async () => {
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
    expect(response.body.message).includes("Invalid e-mail or password.");
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
});
