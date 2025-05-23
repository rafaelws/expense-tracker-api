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

describe("GET /expenses", () => {
  const { up, down, createUser, createExpense } = setupTest();

  beforeAll(() => up());
  afterAll(async () => await down());

  it("(500) should fail when an error happens", async () => {
    const { token } = await createUser();

    const message = "Simulated Error";

    const failMock = vi
      .spyOn(DatabaseExpenseRepo.prototype, "get")
      .mockRejectedValue(new Error(message));

    onTestFinished(() => {
      failMock.mockRestore();
    });

    const query = new URLSearchParams({ ref: "2024-07-23", period: "45d" });

    const { body } = await request(app)
      .get(`/expenses?${query}`)
      .auth(token, { type: "bearer" })
      .expect(500);

    expect(body.message).toBe(message);
  });

  it("(401) should be authenticated", async () => {
    const query = new URLSearchParams({ ref: "2024-07-23", period: "45d" });
    await request(app).get(`/expenses?${query}`).expect(401);
  });

  it.each([
    {},
    { ref: "2024-07-12" },
    { period: "15d" },
    { ref: "invalid date", period: "15d" },
    { ref: "2024-07-11", period: "33d" },
    { ref: "not a date", period: "1d" },
  ])(
    "(400) should not get expenses with invalid query params ($period: $ref)",
    async ({ ref, period }) => {
      const { token } = await createUser();

      const query = new URLSearchParams();

      if (ref) query.append("ref", ref);
      if (period) query.append("period", period);

      await request(app)
        .get(`/expenses?${query}`)
        .auth(token, { type: "bearer" })
        .expect(400);
    },
  );

  it("(200) should get expenses from last 15 days", async () => {
    const { id, token } = await createUser();
    const expenses = [
      {
        amount: "15.99",
        date: "2024-06-02",
        description: "Expensive pen",
      },
      { amount: "150.00", date: "2024-07-01", description: "Office supplies" },
      { amount: "45.50", date: "2024-07-02", description: "Expensive dinner" },
    ];

    await Promise.all(expenses.map((e) => createExpense(id, e)));

    const query = new URLSearchParams({
      ref: "2024-07-10",
      period: "15d",
    });

    const { body } = await request(app)
      .get(`/expenses?${query}`)
      .auth(token, { type: "bearer" })
      .expect(200);

    expect(body.length).toBe(2);

    expect(body[0].amount).toBe(expenses[2].amount);
    expect(body[0].description).toBe(expenses[2].description);
    expect(body[0].date).toBe(new Date(expenses[2].date).toISOString());

    expect(body[1].amount).toBe(expenses[1].amount);
    expect(body[1].description).toBe(expenses[1].description);
    expect(body[1].date).toBe(new Date(expenses[1].date).toISOString());
  });

  it("(200) should not get expenses from a different user", async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const expenses = [
      { amount: "50.33", date: "2024-07-04", description: "Lunch" },
    ];

    await Promise.all(expenses.map((e) => createExpense(user1.id, e)));

    const query = new URLSearchParams({
      ref: "2024-07-05",
      period: "15d",
    });

    const { body } = await request(app)
      .get(`/expenses?${query}`)
      .auth(user2.token, { type: "bearer" })
      .expect(200);

    expect(body.length).toBe(0);
  });

  it("(200) should get expenses from current month", async () => {
    const { id, token } = await createUser();
    const expenses = [
      {
        amount: "15.99",
        date: "2024-06-02",
        description: "Expensive pen",
      },
      { amount: "150.00", date: "2024-07-01", description: "Office supplies" },
      { amount: "20.99", date: "2024-07-31", description: "e-Book" },
      { amount: "45.50", date: "2024-07-04", description: "Expensive dinner" },
      { amount: "2.30", date: "2024-08-02", description: "Coffee" },
    ];

    await Promise.all(expenses.map((e) => createExpense(id, e)));

    const query = new URLSearchParams({
      ref: "2024-07-19",
      period: "1m",
    });

    const { body } = await request(app)
      .get(`/expenses?${query}`)
      .auth(token, { type: "bearer" })
      .expect(200);

    expect(body.length).toBe(3);

    expect(body[0].amount).toBe(expenses[2].amount);
    expect(body[0].description).toBe(expenses[2].description);
    expect(body[0].date).toBe(new Date(expenses[2].date).toISOString());

    expect(body[1].amount).toBe(expenses[3].amount);
    expect(body[1].description).toBe(expenses[3].description);
    expect(body[1].date).toBe(new Date(expenses[3].date).toISOString());

    expect(body[2].amount).toBe(expenses[1].amount);
    expect(body[2].description).toBe(expenses[1].description);
    expect(body[2].date).toBe(new Date(expenses[1].date).toISOString());
  });
});
