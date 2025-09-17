import type { Server } from "node:http";
import request from "supertest";
import { getTestServer } from "tests/http-utils";
import {
  createExpense,
  createIsolatedTestUser,
  createTag,
  createTestUser,
  createWallet,
  expectExpenseMatch,
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
import type { CreateExpenseDTO } from "@/features/expenses/expense-schema";
import { ExpenseService } from "@/features/expenses/expense-service";

describe("GET /expenses", () => {
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
    const failMock = vi
      .spyOn(ExpenseService.prototype, "listExpenses")
      .mockRejectedValue(new Error());

    onTestFinished(() => {
      failMock.mockRestore();
    });

    const query = new URLSearchParams({
      month: "2024-07",
    });

    await request(app)
      .get(`/expenses?${query}`)
      .auth(user.token, { type: "bearer" })
      .expect(500);
  });

  it("(401) should be authenticated", async () => {
    const query = new URLSearchParams({
      month: "2024-07",
    });
    await request(app).get(`/expenses?${query}`).expect(401);
  });

  it.each([
    {},
    { month: "invalid" },
    { month: "" },
    { month: "invalid date" },
    { month: "2025-2" },
    { month: "2025/2" },
    { month: "07-2025" },
    { month: "07/2025" },
  ])(
    "(400) should not get expenses with invalid query params (month: $month)",
    async ({ month }) => {
      const query = new URLSearchParams();

      if (month) query.append("month", month);

      await request(app)
        .get(`/expenses?${query}`)
        .auth(user.token, { type: "bearer" })
        .expect(400);
    },
  );

  it("(200) should return expenses without wallet from selected month", async () => {
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
      month: "2024-07",
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
      month: "2024-07",
    });

    const { body } = await request(app)
      .get(`/expenses?${query}`)
      .auth(user2.token, { type: "bearer" })
      .expect(200);

    expect(body.length).toBe(0);
  });

  it("(200) should get expenses from a given month with wallet (no tags)", async () => {
    const wallet = await createWallet(user.id, { name: "Main" });

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
        occurredAt: "2024-06-20",
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
      month: "2024-06",
    });

    const { body } = await request(app)
      .get(`/expenses?${query}`)
      .auth(user.token, { type: "bearer" })
      .expect(200);

    expect(body.length).toBe(1);
    expect(body[0].wallet.name).toBe(wallet.name);
    expect(body[0].expenses.length).toBe(2);
    expectExpenseMatch(body[0].expenses[0], expenses[1]);
    expectExpenseMatch(body[0].expenses[1], expenses[0]);
    // @ts-expect-error e is PublicExpense
    expect(body[0].expenses.some((e) => e.title === "Old expense")).toBe(false);
  });

  it("(200) should get expenses from a given month with tags (no wallet)", async () => {
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
      month: "2024-07",
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

  it("(200) should return grouped expenses by wallet and include associated tags", async () => {
    const wallets = await Promise.all([
      createWallet(user.id, { name: "Disposable Income" }),
      createWallet(user.id, { name: "Groceries" }),
    ]);

    const expenses: CreateExpenseDTO[] = [
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

    const created = await Promise.all(
      expenses.map((e) => createExpense(user.id, e)),
    );

    const tags = await Promise.all([
      createTag(user.id, { name: "Trip" }, [created[0].id, created[1].id]),
      createTag(user.id, { name: "Food" }, [created[2].id]),
    ]);

    const query = new URLSearchParams({
      month: "2024-07",
    });

    const { body } = await request(app)
      .get(`/expenses?${query}`)
      .auth(user.token, { type: "bearer" })
      .expect(200);

    expect(body.length).toBe(3);

    for (const { wallet, expenses: groupExpenses } of body) {
      if (!wallet) {
        expectExpenseMatch(groupExpenses[0], created[3]);
        expect(groupExpenses[0].tags).not.toBeDefined();
      } else if (wallet.id === wallets[0].id) {
        expectExpenseMatch(groupExpenses[0], created[1]);
        expectExpenseMatch(groupExpenses[1], created[0]);
        expect(groupExpenses[0].tags[0].id).toBe(tags[0].id);
        expect(groupExpenses[1].tags[0].id).toBe(tags[0].id);
      } else if (wallet.id === wallets[1].id) {
        expectExpenseMatch(groupExpenses[0], created[2]);
        expect(groupExpenses[0].tags[0].id).toBe(tags[1].id);
      }
    }
  });
});
