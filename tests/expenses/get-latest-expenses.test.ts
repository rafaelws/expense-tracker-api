import type { Server } from "node:http";
import request from "supertest";
import { getTestServer } from "tests/http-utils";
import {
  createExpense,
  createIsolatedTestUser,
  createTestUser,
  removeExpense,
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
import type { ExpenseEntity } from "@/features/expenses/expense-entity";
import type { PublicExpense } from "@/features/expenses/expense-mapper";
import { ExpenseRepository } from "@/features/expenses/expense-repository";
import type { CreateExpenseDTO } from "@/features/expenses/expense-schema";

const resourcePath = "/expenses/latest";

describe(`GET ${resourcePath}`, () => {
  let app: Server;
  let user: TestUser;
  let expenses: ExpenseEntity[] = [];
  const fixedDate = new Date(2024, 6, 5); // 2024-07-05

  beforeAll(async () => {
    app = await getTestServer();

    vi.setSystemTime(fixedDate);
    user = await createTestUser();

    const expensesToCreate: CreateExpenseDTO[] = [
      {
        amount: "15.99",
        occurredAt: "2024-06-02",
        title: "Expensive pen",
        status: 1,
      },
      {
        amount: "150.00",
        occurredAt: "2024-06-17",
        title: "Office supplies",
        status: 1,
      },
      {
        amount: "20.99",
        occurredAt: "2024-07-05",
        title: "e-Book",
        status: 1,
        description: "the description should match as expected",
      },
      {
        amount: "45.50",
        occurredAt: "2024-06-20",
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

    expenses = await Promise.all(
      expensesToCreate.map((expense) => createExpense(user.id, expense, false)),
    );
  });

  afterAll(async () => {
    vi.useRealTimers();
    await removeTestUser(user.id);
    await Promise.all(expenses.map((e) => removeExpense(e.id)));
  });

  it.each([
    {
      days: 15,
      expectedTitles: ["e-Book", "Expensive dinner"],
    },
    {
      days: 30,
      expectedTitles: ["e-Book", "Expensive dinner", "Office supplies"],
    },
    {
      days: 45,
      expectedTitles: [
        "e-Book",
        "Expensive dinner",
        "Office supplies",
        "Expensive pen",
      ],
    },
  ])(
    "(200) should get expenses from last $days days",
    async ({ days, expectedTitles }) => {
      const query = new URLSearchParams({ days: String(days) });

      const { body } = await request(app)
        .get(`${resourcePath}?${query}`)
        .auth(user.token, { type: "bearer" })
        .expect(200);

      const results: PublicExpense[] = body.result ?? [];

      expect(results.map((e) => e.title)).toEqual(expectedTitles);
    },
  );

  it("(500) should fail when an error happens", async () => {
    const failMock = vi
      .spyOn(ExpenseRepository.prototype, "findAll")
      .mockRejectedValue(new Error());

    onTestFinished(() => {
      failMock.mockRestore();
    });

    const query = new URLSearchParams({ days: String(30) });

    await request(app)
      .get(`${resourcePath}?${query}`)
      .auth(user.token, { type: "bearer" })
      .expect(500);
  });

  it("(401) should be authenticated", async () => {
    const query = new URLSearchParams({ days: "30" });
    await request(app).get(`${resourcePath}?${query}`).expect(401);
  });

  it.each([
    {},
    { days: null },
    { days: "invalid" },
    { days: "" },
    { days: "90" },
    { days: "0" },
    { days: "-15" },
    { days: "0.1" },
  ])(
    "(400) should not get expenses with invalid query params (days: $days)",
    async ({ days }) => {
      const query = new URLSearchParams();

      if (days) query.append("days", days);

      await request(app)
        .get(`${resourcePath}?${query}`)
        .auth(user.token, { type: "bearer" })
        .expect(400);
    },
  );

  it("(200) should not get expenses from a different user", async () => {
    const user2 = await createIsolatedTestUser();
    const query = new URLSearchParams({ days: "30" });
    const { body } = await request(app)
      .get(`${resourcePath}?${query}`)
      .auth(user2.token, { type: "bearer" })
      .expect(200);
    expect(body.result.length).toBe(0);
    expect(body.result).toEqual([]);
  });

  it("(200) should include expenses that occurred exactly N days ago", async () => {
    const query = new URLSearchParams({ days: "15" });

    const { body } = await request(app)
      .get(`${resourcePath}?${query}`)
      .auth(user.token, { type: "bearer" })
      .expect(200);

    const expenses: PublicExpense[] = body.result ?? [];
    const titles = expenses.map((e) => e.title);
    expect(titles).toContain("Expensive dinner");
  });
});
