import { describe, expect, it, vi } from "vitest";

import { BigNumber } from "../common";
import { CreateExpense } from "./CreateExpense";
import { ChangeableExpense, ExpenseRepo } from "./ExpenseRepo";

const bigNumber = (returnValues?: {
  gt?: boolean;
  lte?: boolean;
  valid?: boolean;
}) => {
  const { gt = true, lte = true, valid = true } = returnValues || {};
  return {
    gt: vi.fn().mockReturnValue(gt),
    lte: vi.fn().mockReturnValue(lte),
    isValid: vi.fn().mockReturnValue(valid),
  } satisfies BigNumber;
};

describe("Create Expense", () => {
  it("should not create an Expense with empty description", async () => {
    const big = bigNumber();
    const expense = {
      description: "     ",
      amount: "100.0",
      date: new Date(),
    };
    const uc = new CreateExpense({} as unknown as ExpenseRepo, big);
    await expect(uc.perform("user-uuid", expense)).resolves.toBe(null);
    expect(big.lte).toHaveBeenCalledWith("100.0", 0);
  });

  it("should not create an Expense with an invalid amount", async () => {
    const big = bigNumber();
    const expense = {
      description: "some random description",
      amount: "-100.0",
      date: new Date(),
    };
    const uc = new CreateExpense({} as unknown as ExpenseRepo, big);
    await expect(uc.perform("user-uuid", expense)).resolves.toBe(null);
    expect(big.lte).toHaveBeenCalledWith("-100.0", 0);
  });

  it("should create an Expense with valid data", async () => {
    const big = bigNumber({ lte: false });
    const repo = {
      create: vi.fn(async (userId: string, expense: ChangeableExpense) => ({
        id: "uuid",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        ...expense,
      })),
    } as unknown as ExpenseRepo;

    const expense = {
      description: "random description",
      amount: "100.0",
      date: new Date(),
    };

    const uc = new CreateExpense(repo, big);
    const result = await uc.perform("user-uuid", expense);

    expect(repo.create).toBeCalledWith("user-uuid", expense);
    expect(result).toEqual({
      id: "uuid",
      ...expense,
    });
    expect(big.lte).toHaveBeenCalledWith("100.0", 0);
  });
});
