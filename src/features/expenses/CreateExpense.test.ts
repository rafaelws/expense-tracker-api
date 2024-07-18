import { describe, expect, it, vi } from "vitest";

import { CreateExpense } from "./CreateExpense";
import { ChangeableExpense, ExpenseRepo } from "./ExpenseRepo";

describe("Create Expense", () => {
  it("should not create an Expense with empty description", async () => {
    const expense = {
      description: "     ",
      amount: 100.0,
      date: new Date(),
    };
    const uc = new CreateExpense({} as unknown as ExpenseRepo);
    await expect(uc.perform("user-uuid", expense)).resolves.toBe(null);
  });

  it("should not create an Expense with an invalid amount", async () => {
    const expense = {
      description: "some random description",
      amount: -100.0,
      date: new Date(),
    };
    const uc = new CreateExpense({} as unknown as ExpenseRepo);
    await expect(uc.perform("user-uuid", expense)).resolves.toBe(null);
  });

  it("should create an Expense with valid data", async () => {
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
      amount: 100.0,
      date: new Date(),
    };

    const uc = new CreateExpense(repo);
    const result = await uc.perform("user-uuid", expense);

    expect(repo.create).toBeCalledWith("user-uuid", expense);
    expect(result).toEqual({
      id: "uuid",
      ...expense,
    });
  });
});
