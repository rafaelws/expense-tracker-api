import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { setupTest } from "@/infra/common";
import { app } from "@/infra/http/app";

describe("POST /expenses", () => {
  const { up, down, clear, createToken } = setupTest();

  beforeAll(() => up());
  afterEach(async () => await clear());
  afterAll(async () => await down());

  it("(401) should be authenticated", async () => {
    await request(app)
      .post("/expenses")
      .send({ amount: "100.0", description: "expensive", date: "2024-7-20" })
      .expect(401);
  });

  it("(201) should create a valid expense", async () => {
    const token = await createToken();

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

  it("(400) should not create an invalid expense", async () => {
    const token = await createToken();

    const cases = [
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
    ];

    for (const { data, result } of cases) {
      const { body } = await request(app)
        .post("/expenses")
        .auth(token, { type: "bearer" })
        .send(data)
        .expect("Content-Type", /json/)
        .expect(400);

      if (result) {
        expect(body?.message).toContain(result);
      }
    }
  });
});
