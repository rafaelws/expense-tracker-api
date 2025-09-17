import type { Server } from "node:http";
import request from "supertest";
import { getTestServer } from "tests/http-utils";
import {
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
import { WalletRepository } from "@/features/wallets/wallet-repository";
import type { CreateWalletDTO } from "@/features/wallets/wallet-schema";

const resourcePath = "/wallets";

describe(`POST ${resourcePath}`, () => {
  let app: Server;
  let user: TestUser;

  beforeAll(async () => {
    app = await getTestServer();
    user = await createTestUser();
  });

  afterAll(() => removeTestUser(user.id));

  it("(500) should fail when an error happens", async () => {
    const resource: CreateWalletDTO = {
      name: "Credit Card #1",
      bgColor: "black",
      fgColor: "yellow",
      sortOrder: 1,
    };

    const failMock = vi
      .spyOn(WalletRepository.prototype, "create")
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
    const resource: CreateWalletDTO = {
      name: "Bank Account #3",
      bgColor: "black",
      fgColor: "white",
      sortOrder: 4,
    };
    await request(app).post(resourcePath).send(resource).expect(401);
  });

  it("(201) should create a valid resource", async () => {
    const resource: CreateWalletDTO = {
      name: "Account #2",
      sortOrder: 2,
    };

    const { body } = await request(app)
      .post(resourcePath)
      .auth(user.token, { type: "bearer" })
      .send(resource)
      .expect(201);

    expect(body).toHaveProperty("id");
    expect(body?.name).toBe(resource.name);
    expect(body?.sortOrder).toBe(resource.sortOrder);
  });

  const validationCases: CreateWalletDTO[] = [
    { name: "" },
    { name: "             " },
    { name: "Invalid sortOrder", sortOrder: -1 },
    { name: "Invalid sortOrder", sortOrder: Infinity },
    { name: "Invalid sortOrder", sortOrder: -Infinity },
    { name: "Valid name", fgColor: "" },
    { name: "Valid name", bgColor: "" },
    { name: "Valid name", fgColor: "", bgColor: "" },
    { name: "Valid name", fgColor: "", bgColor: "", sortOrder: 1 },
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
