import request from "supertest";
import { createExpense, createUser } from "tests/test-utils";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { ExpenseRepository } from "@/features/expenses/expense-repository";
import { app } from "@/http/server";
import { uuid } from "@/lib/uuid";

describe("DELETE /expenses/:id", () => {
  it("(500) should fail when an error happens", async () => {
    const user = await createUser();
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
      .delete(`/expenses/${uuid()}`)
      .auth(user.token, { type: "bearer" })
      .expect(400);
  });

  it(`(400) should not delete an expense 
    that belongs to a different user`, async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const expense = await createExpense(user1.id);

    const { body } = await request(app)
      .delete(`/expenses/${expense.id}`)
      .auth(user2.token, { type: "bearer" })
      .expect(400);

    expect(body?.message).toMatch(/expense not found/i);
  });
});
