import { describe, expect, it } from "vitest";

import type { ExpenseEntity } from "@/features/expenses/expense-entity";
import { toPublicExpense } from "@/features/expenses/expense-mapper";
import type { TagEntity } from "@/features/tags/tag-entity";
import { uuid } from "@/lib/uuid";

describe("toPublicExpense", () => {
  const now = new Date();
  const userId = uuid();
  const walletId = uuid();

  const tags: TagEntity[] = [
    {
      id: uuid(),
      name: "Food",
      fgColor: "#000000",
      bgColor: "#ffffff",
      createdAt: now,
      updatedAt: now,
      userId,
    },
    {
      id: uuid(),
      name: "Business",
      fgColor: "#111111",
      bgColor: "#eeeeee",
      createdAt: now,
      updatedAt: now,
      userId,
    },
  ];

  const expense: ExpenseEntity = {
    id: uuid(),
    title: "Lunch",
    description: "Business lunch",
    occurredAt: "2025-05-20",
    amount: "45.50",
    status: 1,
    walletId,
    tagIds: [tags[0].id, tags[1].id],
    createdAt: now,
    updatedAt: now,
    userId,
  };

  it("returns public expense with tags", () => {
    expect(toPublicExpense({ ...expense, tags })).toEqual({
      id: expense.id,
      title: "Lunch",
      description: "Business lunch",
      occurredAt: "2025-05-20",
      amount: "45.50",
      status: 1,
      walletId,
      tagIds: expense.tagIds,
      tags: [
        {
          id: tags[0].id,
          name: "Food",
          fgColor: "#000000",
          bgColor: "#ffffff",
        },
        {
          id: tags[1].id,
          name: "Business",
          fgColor: "#111111",
          bgColor: "#eeeeee",
        },
      ],
    });
  });

  it("returns public expense without tags if not provided", () => {
    expect(toPublicExpense(expense)).toEqual({
      id: expense.id,
      title: "Lunch",
      description: "Business lunch",
      occurredAt: "2025-05-20",
      amount: "45.50",
      status: 1,
      walletId,
      tagIds: expense.tagIds,
    });
  });

  it("omits tagIds if not present in the entity", () => {
    const expected = { ...expense };
    delete expected.tagIds;

    expect(toPublicExpense(expected)).toEqual({
      id: expense.id,
      title: "Lunch",
      description: "Business lunch",
      occurredAt: "2025-05-20",
      amount: "45.50",
      status: 1,
      walletId,
    });
  });
});
