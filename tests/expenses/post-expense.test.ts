import request from "supertest";
import { createTestUser, removeTestUser, TestUser } from "tests/test-utils";
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

  it("(201) should create a valid expense", async () => {
    const expense: CreateExpenseDTO = {
      amount: "100.0",
      title: "expensive",
      occurredAt: "2024-07-20",
      status: 1,
    };

    const { body } = await request(app)
      .post("/expenses")
      // .set("Authorization", `Bearer: ${token}`)
      .auth(user.token, { type: "bearer" })
      .send(expense)
      .expect(201);

    expect(body).toHaveProperty("id");
    expect(body?.amount).toBe(expense.amount);
    expect(body?.title).toBe(expense.title);
    expect(body?.occurredAt).toBe(expense.occurredAt);
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
