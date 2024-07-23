import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { setupTest } from "@/infra/common/test-utils";
import { app } from "@/infra/http/app";

describe("DELETE /expenses/:id", () => {
  const { up, down, createUser, createExpense } = setupTest();

  beforeAll(() => up());
  afterAll(async () => await down());

  it("(401) should be authenticated", async () => {
    const user = await createUser();
    const expense = await createExpense(user.id);

    await request(app).delete(`/expenses/${expense.id}`).expect(401);
  });

  it("(204) should remove a valid expense", async () => {
    const user = await createUser();
    const expense = await createExpense(user.id);

    await request(app)
      .delete(`/expenses/${expense.id}`)
      .auth(user.token, { type: "bearer" })
      .expect(204);
  });

  it("(400) should not remove with an invalid id", async () => {
    const user = await createUser();

    await request(app)
      .delete("/expenses/abc123")
      .auth(user.token, { type: "bearer" })
      .expect(400);
  });

  it("(400) should not delete an expense from another user", async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const expense = await createExpense(user1.id);

    const { body } = await request(app)
      .delete(`/expenses/${expense.id}`)
      .auth(user2.token, { type: "bearer" })
      .expect(400);

    expect(body?.message).toContain("Expense not found.");
  });
});
