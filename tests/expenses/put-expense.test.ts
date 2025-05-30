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

import { ExpenseRepository } from "@/features/expenses/expense-repository";
import { UpdateExpenseDTO } from "@/features/expenses/expense-schema";
import { TagEntity } from "@/features/tags/tag-entity";
import { WalletEntity } from "@/features/wallets/wallet-entity";
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

  const updateCases: Array<{
    description: string;
    update: UpdateExpenseDTO;
    wallet?: Partial<WalletEntity>;
    tags?: Partial<TagEntity>[];
  }> = [
    {
      description: "Update only amount",
      update: { amount: "87.65" },
    },
    {
      description: "Update title and occurredAt",
      update: {
        title: "Dinner",
        occurredAt: "2024-10-05",
      },
    },
    {
      description: "Update amount and assign wallet",
      update: { amount: "240.00" },
      wallet: { name: "Main account" },
    },
    {
      description: "Update title and assign tags",
      update: { title: "Biking gear" },
      tags: [{ name: "Health" }, { name: "Outdoors" }],
    },
    {
      description: "Full update: amount, title, occurredAt, wallet, tags",
      update: {
        amount: "190.00",
        title: "Workshop registration",
        occurredAt: "2025-01-15",
      },
      wallet: { name: "Disposable Income" },
      tags: [{ name: "Hobbies" }, { name: "Learning" }],
    },
  ];
  it.each(updateCases)(
    "(200) should update expense with: %s",
    async ({ update, wallet, tags }) => {
      const expense = await createExpense(user.id, {
        amount: "100.00",
        title: "Valid expense (base)",
        occurredAt: "2025-05-30",
      });

      const payload = { ...update };

      if (wallet) {
        const { id } = await createWallet(user.id, wallet);
        payload.walletId = id;
      }

      if (tags) {
        const ids = await Promise.all(
          tags.map((tag) => createTag(user.id, tag)),
        ).then((results) => results.map((t) => t.id));
        payload.tagIds = ids;
      }

      const { body } = await request(app)
        .put(`/expenses/${expense.id}`)
        .auth(user.token, { type: "bearer" })
        .send(payload)
        .expect(200);

      expect(body.id).toBe(expense.id);
      expectExpenseMatch(body, { ...expense, ...payload });
    },
  );

  it("(200) should update with a valid wallet and tags", async () => {
    const wallet = await createWallet(user.id, { name: "Secodary acc" });
    const tag1 = await createTag(user.id, { name: "Food" });
    const tag2 = await createTag(user.id, { name: "Groceries" });

    const expense = await createExpense(user.id, {
      amount: "100",
      title: "Groceries",
      occurredAt: "2024-07-23",
    });

    const update = {
      amount: "99.9",
      title: "Weekly Groceries",
      occurredAt: "2025-06-21",
      walletId: wallet.id,
      tagIds: [tag1.id, tag2.id],
    };

    const { body } = await request(app)
      .put(`/expenses/${expense.id}`)
      .auth(user.token, { type: "bearer" })
      .send(update)
      .expect(200);

    expect(body.id).toBe(expense.id);
    expectExpenseMatch(body, { ...expense, ...update });
  });

  it.each([
    {},
    { amount: "invalid" },
    { title: "" },
    { description: "" },
    { occurredAt: "invalid-date" },
    { amount: "invalid", title: "" },
    { amount: "invalid", occurredAt: "invalid-date" },
    { title: "", occurredAt: "invalid-date" },
    { amount: "invalid", title: "", occurredAt: "invalid-date" },
    { amount: "-100.0" },
    { amount: "0.0" },
    { amount: "100.0$" },
    { occurredAt: "2024/08/15" },
    { occurredAt: "15-08-2024" },
    { walletId: "123" },
    { walletId: "invalid-uuid" },
    { tagIds: ["invalid-uuid"] },
    { tagIds: ["not-a-uuid", "also-wrong"] },
    { walletId: "not-a-uuid", tagIds: ["still-wrong"] },
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

  it("(404) should not update an expense that belongs to a different user", async () => {
    const user2 = await createIsolatedTestUser();
    const expense = await createExpense(user.id);

    const { body } = await request(app)
      .put(`/expenses/${expense.id}`)
      .auth(user2.token, { type: "bearer" })
      .send({ title: "Rent" })
      .expect(404);

    expect(body.message).toMatch(/^expense#[\w-]+ not found$/i);
  });

  it("(400) should not update with tags that belong to another user", async () => {
    const user2 = await createIsolatedTestUser(false);
    const validTag = await createTag(user.id, { name: "Own Tag" });
    const invalidTag = await createTag(user2.id, { name: "Foreign Tag" });

    const expense = await createExpense(user.id, {
      amount: "42.00",
      title: "Valid Expense",
      occurredAt: "2025-02-11",
    });

    const update = { tagIds: [validTag.id, invalidTag.id] };

    const { body } = await request(app)
      .put(`/expenses/${expense.id}`)
      .auth(user.token, { type: "bearer" })
      .send(update)
      .expect(400);

    expect(body.message).toMatch(/tagIds do not belong to user/i);
  });

  it("(400) should not update with a wallet that belongs to another user", async () => {
    const user2 = await createIsolatedTestUser();
    const foreignWallet = await createWallet(user2.id, {
      name: "User2 Wallet",
    });
    const expense = await createExpense(user.id, {
      amount: "99.99",
      title: "Valid Expense",
      occurredAt: "2025-07-25",
    });

    const update = { walletId: foreignWallet.id };

    const { body } = await request(app)
      .put(`/expenses/${expense.id}`)
      .auth(user.token, { type: "bearer" })
      .send(update)
      .expect(400);

    expect(body.message).toMatch(/wallet id does not belong to user/i);
  });
});
