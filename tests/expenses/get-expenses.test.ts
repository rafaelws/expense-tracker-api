import request from "supertest";
import {
  createExpense,
  createIsolatedTestUser,
  createTag,
  createTestUser,
  createWallet,
  expectExpenseMatch,
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

  afterAll(async () => {
    await removeTestUser(user.id);
  });

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

    const noWalletExpenses = body[0].expenses;

    expect(noWalletExpenses.length).toBe(2);

    expect(noWalletExpenses[0].amount).toBe(expenses[2].amount);
    expect(noWalletExpenses[0].title).toBe(expenses[2].title);
    expect(noWalletExpenses[0].occurredAt).toBe(expenses[2].occurredAt);

    expect(noWalletExpenses[1].amount).toBe(expenses[1].amount);
    expect(noWalletExpenses[1].title).toBe(expenses[1].title);
    expect(noWalletExpenses[1].occurredAt).toBe(expenses[1].occurredAt);
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

    const noWalletExpenses = body[0].expenses;

    expect(noWalletExpenses.length).toBe(3);

    expect(noWalletExpenses[0].amount).toBe(expenses[2].amount);
    expect(noWalletExpenses[0].title).toBe(expenses[2].title);
    expect(noWalletExpenses[0].occurredAt).toBe(expenses[2].occurredAt);
    expect(noWalletExpenses[0].description).toBe(expenses[2].description);

    expect(noWalletExpenses[1].amount).toBe(expenses[3].amount);
    expect(noWalletExpenses[1].title).toBe(expenses[3].title);
    expect(noWalletExpenses[1].occurredAt).toBe(expenses[3].occurredAt);

    expect(noWalletExpenses[2].amount).toBe(expenses[1].amount);
    expect(noWalletExpenses[2].title).toBe(expenses[1].title);
    expect(noWalletExpenses[2].occurredAt).toBe(expenses[1].occurredAt);
  });

  it("(200) should get expenses from current last two months with wallet (no tags)", async () => {
    const wallet = await createWallet(user.id, { name: "Main Wallet" });

    const expenses: CreateExpenseDTO[] = [
      {
        amount: "120.00",
        occurredAt: "2024-06-10",
        title: "Subscription",
        status: 1,
        walletId: wallet.id,
      },
      {
        amount: "200.00",
        occurredAt: "2024-07-20",
        title: "Groceries",
        status: 1,
        walletId: wallet.id,
      },
      {
        amount: "15.00",
        occurredAt: "2025-05-15", // out of range
        title: "Old expense",
        status: 1,
        walletId: wallet.id,
      },
    ];

    await Promise.all(expenses.map((e) => createExpense(user.id, e)));

    const query = new URLSearchParams({
      reference: "2024-07-31",
      period: "2m",
    });

    const { body } = await request(app)
      .get(`/expenses?${query}`)
      .auth(user.token, { type: "bearer" })
      .expect(200);

    expect(body.length).toBe(1);
    expect(body[0].wallet.name).toBe("Main Wallet");
    expect(body[0].expenses.length).toBe(2);
    expectExpenseMatch(body[0].expenses[0], expenses[1]);
    expectExpenseMatch(body[0].expenses[1], expenses[0]);
  });

  it("(200) should get expenses from current last month with tags (no wallet)", async () => {
    const expenses: CreateExpenseDTO[] = [
      {
        amount: "75.00",
        occurredAt: "2024-07-10",
        title: "Electricity",
        status: 1,
      },
      {
        amount: "30.00",
        occurredAt: "2024-07-15",
        title: "Water bill",
        status: 1,
      },
    ];

    const createdExpenses = await Promise.all(
      expenses.map((e) => createExpense(user.id, e)),
    );

    const tags = await Promise.all([
      createTag(user.id, { name: "Utilities" }, [
        createdExpenses[0].id,
        createdExpenses[1].id,
      ]),
      createTag(user.id, { name: "Urgent" }, [createdExpenses[0].id]),
    ]);

    const query = new URLSearchParams({
      reference: "2024-07-31",
      period: "1m",
    });

    const { body } = await request(app)
      .get(`/expenses?${query}`)
      .auth(user.token, { type: "bearer" })
      .expect(200);

    expect(body.length).toBe(1);
    expect(body[0].wallet).toBe(null);
    expect(body[0].expenses.length).toBe(2);
    expect(body[0].expenses[0].tags.length).toBe(1);
    expect(body[0].expenses[1].tags.length).toBe(2);

    expect(
      // @ts-expect-error tag is PublicTag
      body[0].expenses[0].tags.find((tag) => tags[0].id === tag.id),
    ).toBeDefined();

    expect(
      // @ts-expect-error tag is PublicTag
      body[0].expenses[1].tags.find((tag) => tags[0].id === tag.id),
    ).toBeDefined();

    expect(
      // @ts-expect-error tag is PublicTag
      body[0].expenses[1].tags.find((tag) => tags[1].id === tag.id),
    ).toBeDefined();
  });

  it("(200) should get expenses from current last month with tags and wallets (complete)", async () => {
    const wallets = await Promise.all([
      createWallet(user.id, { name: "Disposable Income" }),
      createWallet(user.id, { name: "Groceries" }),
    ]);

    const expensesToCreate: CreateExpenseDTO[] = [
      {
        amount: "1000.00",
        occurredAt: "2024-07-05",
        title: "Flight",
        status: 1,
        walletId: wallets[0].id,
      },
      {
        amount: "300.00",
        occurredAt: "2024-07-10",
        title: "Hotel",
        status: 1,
        walletId: wallets[0].id,
      },
      {
        amount: "50.00",
        occurredAt: "2024-07-20",
        title: "Snacks",
        status: 1,
        walletId: wallets[1].id,
      },
      {
        amount: "19.90",
        occurredAt: "2024-07-01",
        title: "Office Supplies",
        status: 2,
      },
    ];

    const expenses = await Promise.all(
      expensesToCreate.map((e) => createExpense(user.id, e)),
    );

    const tags = await Promise.all([
      createTag(user.id, { name: "Trip" }, [expenses[0].id, expenses[1].id]),
      createTag(user.id, { name: "Food" }, [expenses[2].id]),
    ]);

    const query = new URLSearchParams({
      reference: "2024-07-31",
      period: "1m",
    });

    const { body } = await request(app)
      .get(`/expenses?${query}`)
      .auth(user.token, { type: "bearer" })
      .expect(200);

    expect(body.length).toBe(3);

    for (const { wallet, expenses: bExpenses } of body) {
      if (!wallet) {
        expectExpenseMatch(bExpenses[0], expenses[3]);
        expect(bExpenses[0].tags).not.toBeDefined();
      } else if (wallet.id === wallets[0].id) {
        expectExpenseMatch(bExpenses[0], expenses[1]);
        expectExpenseMatch(bExpenses[1], expenses[0]);
        expect(bExpenses[0].tags[0].id).toBe(tags[0].id);
        expect(bExpenses[1].tags[0].id).toBe(tags[0].id);
      } else if (wallet.id === wallets[1].id) {
        expectExpenseMatch(bExpenses[0], expenses[2]);
        expect(bExpenses[0].tags[0].id).toBe(tags[1].id);
      }
    }
  });
});
