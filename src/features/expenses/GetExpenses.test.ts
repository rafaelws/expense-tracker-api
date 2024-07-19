import { describe, expect, it, vi } from "vitest";

import { ExpenseRepo, ReadableExpense } from "./ExpenseRepo";
import { GetExpense, Period } from "./GetExpenses";

describe("Get Expenses", () => {
  it("should not get Expenses for invalid period", async () => {
    const repo = {
      get: vi.fn().mockResolvedValue([]),
    } as unknown as ExpenseRepo;

    const uc = new GetExpense(repo);
    const invalidPeriod = "1d" as Period;

    await expect(
      uc.perform("user-uuid", new Date(), invalidPeriod),
    ).resolves.toBe(null);
    expect(repo.get).not.toHaveBeenCalled();
  });

  it("should get Expenses for a valid period", async () => {
    const expenses: ReadableExpense[] = [
      {
        id: "expense-uuid",
        amount: 100.0,
        date: new Date(2024, 6, 4),
        description: "random expense",
      },
    ];

    const repo = {
      get: vi.fn().mockResolvedValue(expenses),
    } as unknown as ExpenseRepo;

    const uc = new GetExpense(repo);

    const referenceDate = new Date(2024, 6, 5);
    const validPeriod: Period = "15d";

    await expect(
      uc.perform("user-uuid", referenceDate, validPeriod),
    ).resolves.toEqual(expenses);

    const expectedFromDate = new Date(referenceDate);
    expectedFromDate.setDate(referenceDate.getDate() - 15);
    expect(repo.get).toHaveBeenCalledWith(
      "user-uuid",
      expectedFromDate,
      referenceDate,
    );
  });
});
