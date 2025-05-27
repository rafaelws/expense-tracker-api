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

import { CreateExpenseDTO } from "@/features/expenses/expense-schema";
import { ExpenseService } from "@/features/expenses/expense-service";
import { app } from "@/http/server";

describe("GET /expenses", () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(() => removeTestUser(user.id));

  it("(500) should fail when an error happens", async () => {
    const failMock = vi
      .spyOn(ExpenseService.prototype, "listExpenses")
      .mockRejectedValue(new Error());

    onTestFinished(() => {
      failMock.mockRestore();
    });

    const query = new URLSearchParams({
      reference: "2024-07-23",
      period: "45d",
    });

    await request(app)
      .get(`/expenses?${query}`)
      .auth(user.token, { type: "bearer" })
      .expect(500);
  });

  it("(401) should be authenticated", async () => {
    const query = new URLSearchParams({
      reference: "2024-07-23",
      period: "45d",
    });
    await request(app).get(`/expenses?${query}`).expect(401);
  });

  it.each([
    {},
    { reference: "2024-07-12" },
    { period: "15d" },
    { reference: "invalid date", period: "15d" },
    { reference: "2024-07-11", period: "33d" },
    { reference: "not a date", period: "1d" },
  ])(
    "(400) should not get expenses with invalid query params ($period: $reference)",
    async ({ reference, period }) => {
      const query = new URLSearchParams();

      if (reference) query.append("reference", reference);
      if (period) query.append("period", period);

      await request(app)
        .get(`/expenses?${query}`)
        .auth(user.token, { type: "bearer" })
        .expect(400);
    },
  );

  it("(200) should get expenses from last 15 days", async () => {
    const expenses: CreateExpenseDTO[] = [
      {
        title: "Expensive pen",
        amount: "15.99",
        occurredAt: "2024-06-02",
        status: 1,
      },
      {
        amount: "150.00",
        occurredAt: "2024-07-01",
        title: "Office supplies",
        status: 1,
      },
      {
        amount: "45.50",
        occurredAt: "2024-07-02",
        title: "Expensive dinner",
        status: 1,
      },
    ];

    await Promise.all(
      expenses.map((expense) => createExpense(user.id, expense)),
    );

    const query = new URLSearchParams({
      reference: "2024-07-10",
      period: "15d",
    });

    const { body } = await request(app)
      .get(`/expenses?${query}`)
      .auth(user.token, { type: "bearer" })
      .expect(200);

    expect(body.length).toBe(2);

    expect(body[0].amount).toBe(expenses[2].amount);
    expect(body[0].title).toBe(expenses[2].title);
    expect(body[0].occurredAt).toBe(expenses[2].occurredAt);

    expect(body[1].amount).toBe(expenses[1].amount);
    expect(body[1].title).toBe(expenses[1].title);
    expect(body[1].occurredAt).toBe(expenses[1].occurredAt);
  });

  it("(200) should not get expenses from a different user", async () => {
    const user2 = await createIsolatedTestUser();
    const expenses: CreateExpenseDTO[] = [
      {
        amount: "50.33",
        occurredAt: "2024-07-04",
        title: "Lunch",
        status: 1,
      },
    ];

    await Promise.all(
      expenses.map((expense) => createExpense(user.id, expense)),
    );

    const query = new URLSearchParams({
      reference: "2024-07-05",
      period: "15d",
    });

    const { body } = await request(app)
      .get(`/expenses?${query}`)
      .auth(user2.token, { type: "bearer" })
      .expect(200);

    expect(body.length).toBe(0);
  });

  it("(200) should get expenses from current month", async () => {
    const expenses: CreateExpenseDTO[] = [
      {
        amount: "15.99",
        occurredAt: "2024-06-02",
        title: "Expensive pen",
        status: 1,
      },
      {
        amount: "150.00",
        occurredAt: "2024-07-01",
        title: "Office supplies",
        status: 1,
      },
      {
        amount: "20.99",
        occurredAt: "2024-07-31",
        title: "e-Book",
        status: 1,
        description: "the description should match as expected",
      },
      {
        amount: "45.50",
        occurredAt: "2024-07-04",
        title: "Expensive dinner",
        status: 1,
      },
      {
        amount: "2.30",
        occurredAt: "2024-08-02",
        title: "Coffee",
        status: 1,
      },
    ];

    await Promise.all(
      expenses.map((expense) => createExpense(user.id, expense)),
    );

    const query = new URLSearchParams({
      reference: "2024-07-19",
      period: "1m",
    });

    const { body } = await request(app)
      .get(`/expenses?${query}`)
      .auth(user.token, { type: "bearer" })
      .expect(200);

    expect(body.length).toBe(3);

    expect(body[0].amount).toBe(expenses[2].amount);
    expect(body[0].title).toBe(expenses[2].title);
    expect(body[0].occurredAt).toBe(expenses[2].occurredAt);
    expect(body[0].description).toBe(expenses[2].description);

    expect(body[1].amount).toBe(expenses[3].amount);
    expect(body[1].title).toBe(expenses[3].title);
    expect(body[1].occurredAt).toBe(expenses[3].occurredAt);

    expect(body[2].amount).toBe(expenses[1].amount);
    expect(body[2].title).toBe(expenses[1].title);
    expect(body[2].occurredAt).toBe(expenses[1].occurredAt);
  });
});
