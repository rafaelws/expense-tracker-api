import { describe, expect, it, vi } from "vitest";

import { BigNumber } from "../common";
import { ChangeableExpense, ExpenseRepo, ReadableExpense } from "./ExpenseRepo";
import { UpdateExpense } from "./UpdateExpense";

const bigNumber = (returnValues?: { gt?: boolean; lte?: boolean }) => {
  const { gt = true, lte = true } = returnValues || {};
  return {
    gt: vi.fn().mockReturnValue(gt),
    lte: vi.fn().mockReturnValue(lte),
  } satisfies BigNumber;
};

describe("Update Expense", () => {
  it("should not update an Expense with empty description", async () => {
    const big = bigNumber();
    const uc = new UpdateExpense({} as unknown as ExpenseRepo, big);
    await expect(
      uc.perform("expense-uuid", "user-uuid", {
        description: "     ",
      }),
    ).resolves.toBe(null);
    expect(big.gt).not.toHaveBeenCalled();
  });

  it("should not update an Expense with an invalid amount", async () => {
    const big = bigNumber({ gt: false });

    const uc = new UpdateExpense({} as unknown as ExpenseRepo, big);
    await expect(
      uc.perform("expense-uuid", "user-uuid", { amount: "-100.0" }),
    ).resolves.toBe(null);
    expect(big.gt).toHaveBeenCalledWith("-100.0", 0);
  });

  it("should update an Expense with valid data", async () => {
    const big = bigNumber();
    const repo = {
      update: vi.fn(
        async (id: string, _: string, expense: Partial<ChangeableExpense>) => ({
          id,
          ...expense,
        }),
      ),
    } as unknown as ExpenseRepo;

    const uc = new UpdateExpense(repo, big);

    let result: Partial<ReadableExpense> | null;
    const uid = "user-uuid";
    const eid = "expense-uuid";

    result = await uc.perform(eid, uid, {
      amount: "102.0",
    });
    expect(result?.id).toBe(eid);
    expect(result?.amount).toBe("102.0");
    expect(big.gt).toHaveBeenCalledWith("102.0", 0);

    result = await uc.perform(eid, uid, {
      date: new Date(2024, 2, 22),
    });
    expect(result?.id).toBe(eid);
    expect(result?.date).toEqual(new Date(2024, 2, 22));

    result = await uc.perform(eid, uid, {
      description: "foobar",
    });
    expect(result?.id).toBe(eid);
    expect(result?.description).toBe("foobar");

    result = await uc.perform(eid, uid, {
      description: "foobar",
      date: new Date(2024, 2, 22),
    });
    expect(result?.id).toBe(eid);
    expect(result?.description).toBe("foobar");
    expect(result?.date).toEqual(new Date(2024, 2, 22));

    big.gt.mockClear();
    result = await uc.perform(eid, uid, {
      amount: "101.0",
      description: "foobar",
      date: new Date(2024, 2, 22),
    });
    expect(result?.id).toBe(eid);
    expect(result?.amount).toBe("101.0");
    expect(result?.description).toBe("foobar");
    expect(result?.date).toEqual(new Date(2024, 2, 22));
    expect(big.gt).toHaveBeenCalledWith("101.0", 0);
  });
});
