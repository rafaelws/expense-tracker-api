import { describe, expect, it, vi } from "vitest";

import { ExpenseRepo } from "./ExpenseRepo";
import { RemoveExpense } from "./RemoveExpense";

describe("Remove Expense", () => {
  it("should remove Expense", async () => {
    const repo = {
      one: vi.fn().mockResolvedValue({}),
      remove: async () => {},
    } as unknown as ExpenseRepo;
    const spy = vi.spyOn(repo, "remove");

    const uc = new RemoveExpense(repo);
    const result = await uc.perform("expense-uuid", "user-uuid");

    expect(result).toBe("expense-uuid");
    expect(spy).toHaveBeenCalledWith("expense-uuid", "user-uuid");
    expect(repo.one).toHaveBeenCalledWith("expense-uuid", "user-uuid");
  });

  it("should not remove Expense if not found", async () => {
    const repo = {
      one: vi.fn().mockResolvedValue(null),
      remove: async () => {},
    } as unknown as ExpenseRepo;
    const spy = vi.spyOn(repo, "remove");

    const uc = new RemoveExpense(repo);
    const result = await uc.perform("expense-uuid", "user-uuid");

    expect(result).toBe(null);
    expect(repo.one).toHaveBeenCalledWith("expense-uuid", "user-uuid");
    expect(spy).not.toHaveBeenCalled();
  });
});
