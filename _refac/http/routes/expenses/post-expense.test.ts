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

describe("POST /expenses", () => {
  const { up, down, createUser } = setupTest();

  beforeAll(() => up());
  afterAll(async () => await down());

  it("(500) should fail when an error happens", async () => {
    const { token } = await createUser();

    const expense = {
      amount: "1500.99",
      description: "Simulated Error Expense",
      date: "2024-08-03",
    };

    const message = "Simulated Error";
    const failMock = vi
      .spyOn(DatabaseExpenseRepo.prototype, "create")
      .mockRejectedValue(new Error(message));

    onTestFinished(() => {
      failMock.mockRestore();
    });

    const { body } = await request(app)
      .post("/expenses")
      .auth(token, { type: "bearer" })
      .send(expense)
      .expect(500);
    expect(body.message).toBe(message);
  });

  it("(401) should be authenticated", async () => {
    await request(app)
      .post("/expenses")
      .send({ amount: "100.0", description: "expensive", date: "2024-7-20" })
      .expect(401);
  });

  it("(201) should create a valid expense", async () => {
    const { token } = await createUser();

    const expense = {
      amount: "100.0",
      description: "expensive",
      date: "2024-07-20",
    };

    const { body } = await request(app)
      .post("/expenses")
      // .set("Authorization", `Bearer: ${token}`)
      .auth(token, { type: "bearer" })
      .send(expense)
      .expect(201);

    expect(body).toHaveProperty("id");
    expect(body?.amount).toBe(expense.amount);
    expect(body?.description).toBe(expense.description);
    expect(body?.date).toBe(new Date(expense.date).toISOString());
  });

  it.each([
    { data: {}, result: "Required" },
    { data: { amount: "" }, result: "Required" },
    { data: { date: "  ", amount: "   " }, result: "Required" },
    { data: { description: "", amount: "" }, result: "Required" },
    { data: { date: "", description: "", amount: "" }, result: "Invalid" },
    {
      data: {
        date: "2024-07-20",
        description: "Invalid amount (arbitrary string) expense",
        amount: "abc",
      },
      result: "Invalid",
    },
    {
      data: {
        date: "2024-07-20",
        description: "Invalid amount (Infinity) expense",
        amount: "Infinity",
      },
      result: "Invalid",
    },
    {
      data: {
        amount: "-50.25",
        description: "Invalid amount (negative) expense",
        date: "2024-07-20",
      },
      result: "Invalid amount or description.",
    },
    {
      data: {
        amount: "0.0",
        description: "Invalid amount (zero) expense",
        date: "2024-07-20",
      },
      result: "Invalid amount or description.",
    },
    {
      data: {
        date: "invalid date",
        description: "Invalid date expense",
        amount: "1.0",
      },
      result: "Invalid",
    },
    {
      data: { description: "    ", date: "2024-07-20", amount: "100.0" },
      result: "Invalid amount or description.",
    },
  ])(
    "(400) should not create when ($result): $data",
    async ({ data, result }) => {
      const { token } = await createUser();
      const { body } = await request(app)
        .post("/expenses")
        .auth(token, { type: "bearer" })
        .send(data)
        .expect("Content-Type", /json/)
        .expect(400);

      if (result) {
        expect(body?.message).toContain(result);
      }
    },
  );
});
