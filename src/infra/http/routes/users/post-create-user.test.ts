import bcrypt from "bcryptjs";
import postgres from "postgres";
import request from "supertest";
import { v4 as uuid } from "uuid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { cfg } from "@/infra/common";
import { app } from "@/infra/http/app";

import jwt from "../../common/jwt";

describe("POST /users", () => {
  let sql: postgres.Sql;
  beforeAll(() => {
    sql = postgres(cfg.databaseUrl, { max: 1 });
  });

  afterAll(() => sql.end());

  const randomPass = () => uuid().substring(0, 8);
  const randomEmail = () => `${uuid()}@example.com`;

  async function createUser(): Promise<[string, string, string]> {
    const plainTextPass = randomPass();
    const password = await bcrypt.hash(plainTextPass, 10);
    const user = {
      id: uuid(),
      email: randomEmail(),
      password,
      created_at: new Date(),
      updated_at: new Date(),
    };
    await sql`INSERT INTO users ${sql(user)}`;
    return [user.id, user.email, plainTextPass];
  }

  async function removeUser(id: string) {
    await sql`DELETE FROM users WHERE id=${id}`;
  }

  it("(201) should create a new user with valid data", async () => {
    const email = randomEmail();
    const password = randomPass();

    const response = await request(app)
      .post("/users")
      .send({
        email,
        password,
        passwordConfirmation: password,
      })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(response.body).toHaveProperty("token");

    const id = jwt.verify(response.body.token);
    expect(id).toBeDefined();

    await removeUser(id);
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
    expect(response.body.message).includes("mismatch");
    expect(response.body.message).includes("at least 8");
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
    const [id, email, password] = await createUser();

    const response = await request(app)
      .post("/users")
      .send({
        email,
        password,
        passwordConfirmation: password,
      })
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).eq(
      "Email already in use or password mismatch.",
    );

    await removeUser(id);
  });
});
