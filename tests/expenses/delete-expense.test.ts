import type { Server } from "node:http";
import request from "supertest";
import { getTestServer } from "tests/http-utils";
import {
  createExpense,
  createIsolatedTestUser,
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
import { ExpenseRepository } from "@/features/expenses/expense-repository";
import { uuid } from "@/lib/uuid";

describe("DELETE /expenses/:id", () => {
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
    const expense = await createExpense(user.id);

    const failMock = vi
      .spyOn(ExpenseRepository.prototype, "remove")
      .mockRejectedValue(new Error());

    onTestFinished(() => {
      failMock.mockRestore();
    });

    await request(app)
      .delete(`/expenses/${expense.id}`)
      .auth(user.token, { type: "bearer" })
      .expect(500);
  });

  it("(401) should be authenticated", async () => {
    const expense = await createExpense(user.id);
    await request(app).delete(`/expenses/${expense.id}`).expect(401);
  });

  it("(204) should remove a valid expense", async () => {
    const expense = await createExpense(user.id);

    await request(app)
      .delete(`/expenses/${expense.id}`)
      .auth(user.token, { type: "bearer" })
      .expect(204);
  });

  it("(404) should not remove with an invalid id", async () => {
    const id = uuid();
    const { body } = await request(app)
      .delete(`/expenses/${id}`)
      .auth(user.token, { type: "bearer" })
      .expect(404);

    expect(body.message).toMatch(/^expense#[\w-]+ not found$/i);
  });

  it("(404) should not delete an expense that belongs to a different user", async () => {
    const user2 = await createIsolatedTestUser();
    const expense = await createExpense(user.id);

    const { body } = await request(app)
      .delete(`/expenses/${expense.id}`)
      .auth(user2.token, { type: "bearer" })
      .expect(404);

    expect(body.message).toMatch(/^expense#[\w-]+ not found$/i);
  });
});
