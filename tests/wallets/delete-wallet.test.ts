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
import { WalletRepository } from "@/features/wallets/wallet-repository";
import { uuid } from "@/lib/uuid";

const resourcePath = "/wallets";

describe(`DELETE ${resourcePath}/:id`, () => {
  let app: Server;
  let user: TestUser;

  beforeAll(async () => {
    app = await getTestServer();
    user = await createTestUser();
  });

  afterAll(() => removeTestUser(user.id));

  it("(500) should fail when an error happens", async () => {
    const resource = await createWallet(user.id);

    const failMock = vi
      .spyOn(WalletRepository.prototype, "remove")
      .mockRejectedValue(new Error());

    onTestFinished(() => {
      failMock.mockRestore();
    });

    await request(app)
      .delete(`${resourcePath}/${resource.id}`)
      .auth(user.token, { type: "bearer" })
      .expect(500);
  });

  it("(401) should be authenticated", async () => {
    const resource = await createWallet(user.id);
    await request(app).delete(`${resourcePath}/${resource.id}`).expect(401);
  });

  it("(204) should remove", async () => {
    const resource = await createWallet(user.id);
    await request(app)
      .delete(`${resourcePath}/${resource.id}`)
      .auth(user.token, { type: "bearer" })
      .expect(204);
  });

  it("(404) should not remove with an invalid id", async () => {
    const id = uuid();
    const { body } = await request(app)
      .delete(`${resourcePath}/${id}`)
      .auth(user.token, { type: "bearer" })
      .expect(404);
    expect(body.message).toMatch(/^wallet#[\w-]+ not found$/i);
  });

  it("(404) should not delete a resource that belongs to a different user", async () => {
    const user2 = await createIsolatedTestUser();
    const resource = await createWallet(user.id);

    const { body } = await request(app)
      .delete(`${resourcePath}/${resource.id}`)
      .auth(user2.token, { type: "bearer" })
      .expect(404);

    expect(body?.message).toMatch(/^wallet#[\w-]+ not found$/i);
  });
});
