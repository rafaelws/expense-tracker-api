import request from "supertest";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";

import { setupTest } from "@/lib/test-utils";
import { DatabaseExpenseRepo } from "@/infra/db/repos";
import { app } from "@/infra/http/app";

describe("PUT /expenses/:id", () => {
  const { up, down, createUser, createExpense } = setupTest();

  beforeAll(() => up());
  afterAll(async () => await down());

  it("(500) should fail when an error happens", async () => {
    const user = await createUser();
    const expense = await createExpense(user.id);

    const message = "Simulated Error";
    const failMock = vi
      .spyOn(DatabaseExpenseRepo.prototype, "update")
      .mockRejectedValue(new Error(message));

    onTestFinished(() => {
      failMock.mockRestore();
    });

    const { body } = await request(app)
      .put(`/expenses/${expense.id}`)
      .send({ amount: "1000.0" })
      .auth(user.token, { type: "bearer" })
      .expect(500);

    expect(body.message).toBe(message);
  });

  it("(401) should be authenticated", async () => {
    const user = await createUser();
    const expense = await createExpense(user.id);
    await request(app)
      .put(`/expenses/${expense.id}`)
      .send({ amount: "105.0" })
      .expect(401);
  });

  it.each([
    { amount: "1000.0" },
    { description: "Office chair" },
    { date: "2021-01-02" },
    { amount: "15.33", description: "Printer ink" },
    { amount: "1.55", date: "2020-02-01" },
    { description: "Office supplies", date: "2025-07-22" },
    { amount: "301.50", description: "Desk lamp", date: "2023-05-22" },
  ])("(200) should update a valid expense %o", async (update) => {
    const user = await createUser();
    const expense = await createExpense(user.id, {
      amount: "100.0",
      description: "Groceries",
      date: "2024-07-23",
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
    if (update.description) {
      expect(body?.description).toBe(update.description);
    }
    if (update.date) {
      expect(body?.date).toEqual(new Date(update.date).toISOString());
    }
  });

  it.each([
    {},
    { amount: "invalid" },
    { description: "" },
    { date: "invalid-date" },
    { amount: "invalid", description: "" },
    { amount: "invalid", date: "invalid-date" },
    { description: "", date: "invalid-date" },
    { amount: "invalid", description: "", date: "invalid-date" },
    { amount: "-100.0" },
    { amount: "0.0" },
    { amount: "100.0$" },
    { date: "2024/08/15" },
    { date: "15-08-2024" },
  ])("(400) should not update with invalid data %o", async (update) => {
    const user = await createUser();
    const expense = await createExpense(user.id, {
      amount: "100.0",
      description: "Groceries",
      date: "2024-07-23",
    });

    await request(app)
      .put(`/expenses/${expense.id}`)
      .auth(user.token, { type: "bearer" })
      .send(update)
      .expect(400);
  });

  // eslint-disable-next-line
  it("(400) should not update an expense that belongs to a different user", async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const expense = await createExpense(user1.id);

    await request(app)
      .put(`/expenses/${expense.id}`)
      .auth(user2.token, { type: "bearer" })
      .expect(400);
  });
});
