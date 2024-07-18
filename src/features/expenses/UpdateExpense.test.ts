import { describe, expect, it, vi } from "vitest";

import { ChangeableExpense, ExpenseRepo, ReadableExpense } from "./ExpenseRepo";
import { UpdateExpense } from "./UpdateExpense";

describe("Update Expense", () => {
  it("should not update an Expense with empty description", async () => {
    const uc = new UpdateExpense({} as unknown as ExpenseRepo);
    await expect(
      uc.perform("expense-uuid", "user-uuid", {
        description: "     ",
      }),
    ).resolves.toBe(null);
  });

  it("should not update an Expense with an invalid amount", async () => {
    const uc = new UpdateExpense({} as unknown as ExpenseRepo);
    await expect(
      uc.perform("expense-uuid", "user-uuid", { amount: -100.0 }),
    ).resolves.toBe(null);
  });

  it("should update an Expense with valid data", async () => {
    const repo = {
      update: vi.fn(
        async (
          id: string,
          userId: string,
          expense: Partial<ChangeableExpense>,
        ) => ({
          id,
          amount: 100.0,
          date: new Date(),
          description: "foo",
          ...expense,
        }),
      ),
    } as unknown as ExpenseRepo;

    const uc = new UpdateExpense(repo);

    let result: ReadableExpense | null;
    const uid = "user-uuid";
    const eid = "expense-uuid";

    result = await uc.perform(uid, eid, {
      amount: 101.0,
    });
    expect(result?.amount).toBe(101.0);

    result = await uc.perform(eid, eid, {
      date: new Date(2024, 2, 22),
    });
    expect(result?.date).toEqual(new Date(2024, 2, 22));

    result = await uc.perform(eid, eid, {
      description: "foobar",
    });
    expect(result?.description).toBe("foobar");

    result = await uc.perform(eid, eid, {
      description: "foobar",
      date: new Date(2024, 2, 22),
    });
    expect(result?.description).toBe("foobar");
    expect(result?.date).toEqual(new Date(2024, 2, 22));

    result = await uc.perform(eid, eid, {
      amount: 101.0,
      description: "foobar",
      date: new Date(2024, 2, 22),
    });
    expect(result?.amount).toBe(101.0);
    expect(result?.description).toBe("foobar");
    expect(result?.date).toEqual(new Date(2024, 2, 22));
  });
});
