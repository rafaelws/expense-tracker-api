import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { Down, setupTest } from "@/infra/common";
import { app } from "@/infra/http/app";

describe("POST /expenses", () => {
  let down: Down;
  const { up, createToken, removeUser } = setupTest();

  beforeAll(() => {
    down = up();
  });

  afterAll(() => down());

  it("(401) should be authenticated", async () => {
    await request(app)
      .post("/expenses")
      .send({ amount: "100.0", description: "expensive", date: "2024-7-20" })
      .expect(401);
  });

  it("(201) should create a valid expense", async () => {
    const [token, id] = await createToken();

    const expense = {
      amount: "100.0",
      description: "expensive",
      date: "2024-07-20",
    };

    const { body } = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer: ${token}`)
      .send(expense)
      .expect(201);

    expect(body).toHaveProperty("id");
    expect(body?.amount).toBe(expense.amount);
    expect(body?.description).toBe(expense.description);
    expect(body?.date).toBe(new Date(expense.date).toISOString());

    // expenses are deleted when the user is removed
    await removeUser(id);
  });

  it("(400) should not create an invalid expense", async () => {
    const [token, id] = await createToken();

    const cases = [
      { data: {}, result: "Required" },
      { data: { amount: "" }, result: "Required" },
      { data: { date: "  ", amount: "   " }, result: "Required" },
      { data: { description: "", amount: "" }, result: "Required" },
      { data: { date: "", description: "", amount: "" }, result: "Invalid" },
      {
        data: {
          date: "2024-07-20",
          description: "valid description",
          amount: "abc",
        },
        result: "Invalid",
      },
      {
        data: {
          date: "2024-07-20",
          description: "valid description",
          amount: "Infinity",
        },
        result: "Invalid",
      },
      {
        data: { date: "invalid date", description: "wow", amount: "1.0" },
        result: "Invalid",
      },
      {
        data: { description: "    ", date: "2024-07-20", amount: "100.0" },
        result: "Invalid amount or description.",
      },
      {
        data: {
          amount: "-50.25",
          description: "expensive",
          date: "2024-07-20",
        },
        result: "Invalid amount or description.",
      },
      {
        data: {
          amount: "0.0",
          description: "very zero",
          date: "2024-07-20",
        },
        result: "Invalid amount or description.",
      },
    ];

    for (let i = 0; i < cases.length; i++) {
      const { data, result } = cases[i];

      const { body } = await request(app)
        .post("/expenses")
        .set("Authorization", `Bearer: ${token}`)
        .send(data)
        .expect("Content-Type", /json/)
        .expect(400);

      result && expect(body?.message).includes(result);
    }

    await removeUser(id);
  });
});
