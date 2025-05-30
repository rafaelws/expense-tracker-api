import request from "supertest";
import {
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

import { ExpenseRepository } from "@/features/expenses/expense-repository";
import { CreateExpenseDTO } from "@/features/expenses/expense-schema";
import { TagEntity } from "@/features/tags/tag-entity";
import { WalletEntity } from "@/features/wallets/wallet-entity";
import { app } from "@/http/server";

describe("POST /expenses", () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await createTestUser();
  });

  afterAll(() => removeTestUser(user.id));

  it("(500) should fail when an error happens", async () => {
    const expense: CreateExpenseDTO = {
      amount: "1500.99",
      title: "Simulated Error Expense",
      occurredAt: "2024-08-03",
      status: 1,
    };

    const failMock = vi
      .spyOn(ExpenseRepository.prototype, "create")
      .mockRejectedValue(new Error());

    onTestFinished(() => {
      failMock.mockRestore();
    });

    const result = await request(app)
      .post("/expenses")
      .auth(user.token, { type: "bearer" })
      .send(expense)
      .expect(500);

    expect(result.text).toMatch(/Internal Server Error/i);
  });

  it("(401) should be authenticated", async () => {
    await request(app)
      .post("/expenses")
      .send({ amount: "100.0", description: "expensive", date: "2024-7-20" })
      .expect(401);
  });

  const validCases: Array<{
    description: string;
    expense: CreateExpenseDTO;
    wallet?: Partial<WalletEntity>;
    tags?: Partial<TagEntity>[];
  }> = [
    {
      description: "Expense only",
      expense: {
        amount: "100.0",
        title: "Nail cutter",
        occurredAt: "2024-07-20",
        status: 1,
      },
    },
    {
      description: "Expense with tags",
      expense: {
        amount: "250.0",
        title: "Weekly grocery",
        occurredAt: "2025-05-30",
        status: 1,
      },
      tags: [{ name: "Food" }, { name: "Groceries" }],
    },
    {
      description: "Expense with wallet",
      expense: {
        amount: "44.99",
        title: "Premium Hula Hoop",
        occurredAt: "2025-03-15",
        status: 2,
      },
      wallet: { name: "Disposable Income" },
    },
    {
      description: "Expense with wallet and tags",
      expense: {
        amount: "245.59",
        title: "Car Battery",
        occurredAt: "2025-02-02",
        description: "Car battery died the other day. Had to replace it.",
        status: 1,
      },
      wallet: { name: "Main" },
      tags: [{ name: "Unexpected" }, { name: "Repair" }],
    },
  ];
  it.each(validCases)(
    "(201) should create a valid expense: %s",
    async ({ expense, wallet, tags }) => {
      const payload = { ...expense };
      if (wallet) {
        const { id } = await createWallet(user.id, wallet);
        payload.walletId = id;
      }

      if (tags) {
        const ids = await Promise.all(
          tags.map((tag) => createTag(user.id, tag)),
        ).then((tags) => tags.map((tag) => tag.id));
        payload.tagIds = ids;
      }

      const { body } = await request(app)
        .post("/expenses")
        .auth(user.token, { type: "bearer" })
        .send(payload)
        .expect(201);

      expectExpenseMatch(body, payload);
    },
  );

  it("(400) should not create with an invalid wallet", async () => {
    const user2 = await createIsolatedTestUser(false);
    const wallet = await createWallet(user2.id, { name: "User2 Wallet" });
    const expense: CreateExpenseDTO = {
      amount: "0.99",
      title: "Stickers",
      occurredAt: "2025-05-22",
      status: 3,
      walletId: wallet.id, // fail reason
    };

    const { body } = await request(app)
      .post("/expenses")
      .auth(user.token, { type: "bearer" })
      .send(expense)
      .expect(400);

    expect(body.message).toMatch(/provided wallet id does not belong to user/i);
  });

  it("(400) should not create with an invalid tag", async () => {
    const user2 = await createIsolatedTestUser(false);
    const validTag = await createTag(user.id, { name: "user own tag" });
    const invalidTag = await createTag(user2.id, { name: "user2 tag" });

    const expense: CreateExpenseDTO = {
      amount: "4.3",
      title: "Wrench",
      occurredAt: "2025-06-01",
      status: 2,
      tagIds: [validTag.id, invalidTag.id],
    };

    const { body } = await request(app)
      .post("/expenses")
      .auth(user.token, { type: "bearer" })
      .send(expense)
      .expect(400);

    expect(body.message).toMatch(/provided tagIds do not belong to user/i);
  });

  it.each([
    {},
    { amount: "" },
    { occurredAt: "  ", amount: "   ", status: -1 },
    { title: "", amount: "", status: 1 },
    { date: "", title: "", amount: "", status: 2 },
    { date: "", title: "", amount: "", status: null },
    {
      title: "Invalid amount (arbitrary string)",
      occurredAt: "2024-07-20",
      amount: "abc",
      status: 1,
    },
    {
      title: "Invalid amount (Infinity)",
      occurredAt: "2024-07-20",
      amount: "Infinity",
      status: 1,
    },
    {
      title: "Invalid amount (>8 int digits)",
      occurredAt: "2025-05-25",
      amount: "100000000",
      status: 1,
    },
    {
      title: "Invalid amount (>2 decimal)",
      occurredAt: "2025-05-25",
      amount: "0.001",
      status: 1,
    },
    {
      title: "Invalid amount (NaN string)",
      occurredAt: "2025-05-25",
      amount: "NaN",
      status: 1,
    },
    {
      title: "Invalid amount (NaN literal)",
      occurredAt: "2025-05-25",
      amount: NaN,
      status: 1,
    },
    {
      amount: "-50.25",
      title: "Invalid amount (negative)",
      occurredAt: "2024-07-20",
      status: 1,
    },
    {
      title: "Invalid amount (zero)",
      occurredAt: "2024-07-20",
      amount: "0.0",
      status: 1,
    },
    {
      title: "Invalid occurredAt (date)",
      occurredAt: "invalid date",
      amount: "1.0",
      status: 1,
    },
    { title: "    ", occurredAt: "2024-07-20", amount: "100.0", status: 1 },
    {
      title: "Invalid status",
      occurredAt: "2025-05-25",
      amount: "111.1",
      status: -102,
    },
    {
      title: "Invalid status",
      occurredAt: "2025-05-25",
      amount: "111.1",
      status: -Infinity,
    },
    {
      title: "Invalid status",
      occurredAt: "2025-05-25",
      amount: "111.1",
      status: Infinity,
    },
    {
      title: "Invalid status",
      occurredAt: "2025-05-25",
      amount: "111.1",
      status: "Infinity",
    },
    {
      title: "Invalid status",
      occurredAt: "2025-05-25",
      amount: "111.1",
      status: 0,
    },
    {
      title: "Invalid description",
      description: "     ",
      occurredAt: "2025-05-25",
      amount: "111.1",
      status: 0,
    },
    {
      title: "Invalid description",
      description: null,
      occurredAt: "2025-05-25",
      amount: "10",
      status: 3,
    },
  ])("(400) should not create when %s", async (data) => {
    await request(app)
      .post("/expenses")
      .auth(user.token, { type: "bearer" })
      .send(data)
      .expect("Content-Type", /json/)
      .expect(400);
  });
});
