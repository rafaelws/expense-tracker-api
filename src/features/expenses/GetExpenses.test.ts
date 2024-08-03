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
        amount: "100.0",
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

  it.concurrent.each([
    {
      input: { ref: new Date(2024, 6, 27), period: "invalid period" },
      output: null,
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "15d" },
      output: { from: new Date(2024, 6, 12), to: new Date(2024, 6, 27) },
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "30d" },
      output: { from: new Date(2024, 5, 27), to: new Date(2024, 6, 27) },
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "45d" },
      output: { from: new Date(2024, 5, 12), to: new Date(2024, 6, 27) },
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "90d" },
      output: { from: new Date(2024, 3, 28), to: new Date(2024, 6, 27) },
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "1m" },
      output: { from: new Date(2024, 6, 1), to: new Date(2024, 6, 31) },
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "2m" },
      output: { from: new Date(2024, 5, 1), to: new Date(2024, 6, 31) },
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "3m" },
      output: { from: new Date(2024, 4, 1), to: new Date(2024, 6, 31) },
    },
  ])("should calculate interval for $input.period", ({ input, output }) => {
    expect(
      new GetExpense({} as unknown as ExpenseRepo).calculateInterval(
        input.ref,
        input.period as Period,
      ),
    ).toEqual(output);
  });
});
