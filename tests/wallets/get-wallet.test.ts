import type { Server } from "node:http";
import request from "supertest";
import { getTestServer } from "tests/http-utils";
import {
  createIsolatedTestUser,
  createTestUser,
  createWallet,
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
import type { PublicWallet } from "@/features/wallets/wallet-mapper";
import { WalletRepository } from "@/features/wallets/wallet-repository";

const resourcePath = "/wallets";

describe(`GET ${resourcePath}`, () => {
  let app: Server;
  let user: TestUser;

  beforeAll(async () => {
    app = await getTestServer();
    user = await createTestUser();
  });

  afterAll(async () => {
    await removeTestUser(user.id);
  });

  it("(500) should fail when an error happens", async () => {
    const failMock = vi
      .spyOn(WalletRepository.prototype, "allWallets")
      .mockRejectedValue(new Error());

    onTestFinished(() => {
      failMock.mockRestore();
    });

    await request(app)
      .get(resourcePath)
      .auth(user.token, { type: "bearer" })
      .expect(500);
  });

  it("(401) should be authenticated", async () => {
    await request(app).get(resourcePath).expect(401);
  });

  it("(200) should not get a resource that belongs to a different user", async () => {
    const [user2] = await Promise.all([
      createIsolatedTestUser(),
      createWallet(user.id),
    ]);

    const { body } = await request(app)
      .get(resourcePath)
      .auth(user2.token, { type: "bearer" })
      .expect(200);

    expect(body.length).toBe(0);
  });

  it("(200) should get all wallets from a given user", async () => {
    const wallets = await Promise.all([
      createWallet(user.id, { name: "Main" }),
      createWallet(user.id, { name: "Disposable" }),
    ]);

    const { body } = await request(app)
      .get(resourcePath)
      .auth(user.token, { type: "bearer" })
      .expect(200);

    const response: Array<PublicWallet> = body;
    expect(response.length).toBe(2);

    const ids = response.map(({ id }) => id);
    expect(ids).include(wallets[0].id);
    expect(ids).include(wallets[1].id);
  });
});
