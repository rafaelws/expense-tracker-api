import { describe, expect, it, vi } from "vitest";

import { ExpenseRepo } from "./ExpenseRepo";
import { RemoveExpense } from "./RemoveExpense";

describe("Remove Expense", () => {
  it("should remove Expense", async () => {
    const repo = {
      async remove(_: string) {},
    } as unknown as ExpenseRepo;
    const spy = vi.spyOn(repo, "remove");

    const uc = new RemoveExpense(repo);
    await uc.perform("expense-uuid", "user-uuid");

    expect(spy).toHaveBeenCalledWith("expense-uuid", "user-uuid");
  });
});
