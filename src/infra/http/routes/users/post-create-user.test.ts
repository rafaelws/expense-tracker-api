import request from "supertest";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  onTestFinished,
} from "vitest";

import { setupTest } from "@/infra/common/test-utils";
import { app } from "@/infra/http/app";

import { jwt } from "../../common";

describe("POST /users", () => {
  const { up, down, createUser, removeUserByEmail, randomEmail, randomPass } =
    setupTest();

  beforeAll(() => up());
  afterAll(async () => await down());

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
    expect(body?.message).toContain("Password and confirmation mismatch.");
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
    expect(body?.message).toContain("must contain at least 8 character(s)");
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
    expect(body?.message).includes("email");
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
    expect(body?.message).eq("Invalid e-mail or password.");
  });
});
