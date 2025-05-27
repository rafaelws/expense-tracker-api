import request from "supertest";
import {
  createIsolatedTestUser,
  createTestUser,
  createWallet,
  removeTestUser,
  TestUser,
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
import { UpdateWalletDTO } from "@/features/wallets/wallet-schema";
import { app } from "@/http/server";

const resourcePath = "/wallets";

describe(`PUT ${resourcePath}/:id`, () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(() => removeTestUser(user.id));

  it("(500) should fail when an error happens", async () => {
    const resource = await createWallet(user.id);

    const failMock = vi
      .spyOn(WalletRepository.prototype, "update")
      .mockRejectedValue(new Error());

    onTestFinished(() => {
      failMock.mockRestore();
    });

    await request(app)
      .put(`${resourcePath}/${resource.id}`)
      .send({ name: "Yellow Wallet", bgColor: "yellow", fgColor: "black" })
      .auth(user.token, { type: "bearer" })
      .expect(500);
  });

  it("(401) should be authenticated", async () => {
    const resource = await createWallet(user.id);
    await request(app)
      .put(`${resourcePath}/${resource.id}`)
      .send({ fgColor: "blue" })
      .expect(401);
  });

  it.each([
    { name: "$ Kaching" },
    { fgColor: "yellow" },
    { bgColor: "hsl(120,100%,50%)" },
    { sortOrder: 1 },
    { name: "Wallet #2", fgColor: "black", bgColor: "white", sortOrder: 2 },
    { fgColor: "white", bgColor: "black" },
    { fgColor: "white", bgColor: "black", sortOrder: 1 },
  ])("(200) should update a valid resource %o", async (update) => {
    const resource = await createWallet(user.id, {
      name: "Wallet #1",
      fgColor: "#FFF",
      bgColor: "rgb(0,0,0)",
      sortOrder: 0,
    });

    const { body } = await request(app)
      .put(`${resourcePath}/${resource.id}`)
      .auth(user.token, { type: "bearer" })
      .send(update)
      .expect(200);

    expect(body?.id).toBe(resource.id);
    (["name", "fgColor", "bgColor", "sortOrder"] as const).forEach((key) => {
      if (update[key]) expect(body[key]).toBe(update[key]);
    });
  });

  const validationCases: UpdateWalletDTO[] = [
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
    "(400) should not update with invalid data %o",
    async (update) => {
      const resource = await createWallet(user.id, { name: "Wallet #4" });
      await request(app)
        .put(`${resourcePath}/${resource.id}`)
        .auth(user.token, { type: "bearer" })
        .send(update)
        .expect(400);
    },
  );

  // eslint-disable-next-line
  it("(400) should not update a respirce that belongs to a different user", async () => {
    const user2 = await createIsolatedTestUser();
    const resource = await createWallet(user.id);

    await request(app)
      .put(`${resourcePath}/${resource.id}`)
      .auth(user2.token, { type: "bearer" })
      .expect(400);
  });
});
