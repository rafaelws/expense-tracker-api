import request from "supertest";
import {
  createExpense,
  createIsolatedTestUser,
  createTestUser,
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

import { ExpenseRepository } from "@/features/expenses/expense-repository";
import { app } from "@/http/server";

describe("PUT /expenses/:id", () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(() => removeTestUser(user.id));

  it("(500) should fail when an error happens", async () => {
    const expense = await createExpense(user.id);

    const failMock = vi
      .spyOn(ExpenseRepository.prototype, "update")
      .mockRejectedValue(new Error());

    onTestFinished(() => {
      failMock.mockRestore();
    });

    await request(app)
      .put(`/expenses/${expense.id}`)
      .send({ amount: "1000.0" })
      .auth(user.token, { type: "bearer" })
      .expect(500);
  });

  it("(401) should be authenticated", async () => {
    const expense = await createExpense(user.id);
    await request(app)
      .put(`/expenses/${expense.id}`)
      .send({ amount: "105.0" })
      .expect(401);
  });

  it.each([
    { amount: "1000.0" },
    { title: "Office chair" },
    { occurredAt: "2021-01-02" },
    { amount: "15.33", title: "Printer ink" },
    { amount: "1.55", occurredAt: "2020-02-01" },
    { title: "Office supplies", occurredAt: "2025-07-22" },
    { amount: "301.50", title: "Desk lamp", occurredAt: "2023-05-22" },
  ])("(200) should update a valid expense %o", async (update) => {
    const expense = await createExpense(user.id, {
      amount: "100.0",
      title: "Groceries",
      occurredAt: "2024-07-23",
    });

    const { body } = await request(app)
      .put(`/expenses/${expense.id}`)
      .auth(user.token, { type: "bearer" })
      .send(update)
      .expect(200);

    expect(body?.id).toBe(expense.id);
    if (update.amount) {
      expect(body?.amount).toBe(update.amount);
    }
    if (update.title) {
      expect(body?.title).toBe(update.title);
    }
    if (update.occurredAt) {
      expect(body?.occurredAt).toEqual(update.occurredAt);
    }
  });

  it.each([
    {},
    { amount: "invalid" },
    { title: "" },
    { description: "" },
    { date: "invalid-date" },
    { amount: "invalid", title: "" },
    { amount: "invalid", date: "invalid-date" },
    { title: "", date: "invalid-date" },
    { amount: "invalid", title: "", date: "invalid-date" },
    { amount: "-100.0" },
    { amount: "0.0" },
    { amount: "100.0$" },
    { date: "2024/08/15" },
    { date: "15-08-2024" },
  ])("(400) should not update with invalid data %o", async (update) => {
    const expense = await createExpense(user.id, {
      amount: "100.0",
      title: "Groceries",
      occurredAt: "2024-07-23",
    });

    await request(app)
      .put(`/expenses/${expense.id}`)
      .auth(user.token, { type: "bearer" })
      .send(update)
      .expect(400);
  });

  // eslint-disable-next-line
  it("(400) should not update an expense that belongs to a different user", async () => {
    const user2 = await createIsolatedTestUser();
    const expense = await createExpense(user.id);

    await request(app)
      .put(`/expenses/${expense.id}`)
      .auth(user2.token, { type: "bearer" })
      .expect(400);
  });
});
