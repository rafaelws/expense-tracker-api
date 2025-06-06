import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { lastNDays } from "@/features/expenses/expense-interval";

describe("expense-interval.lastNDays", () => {
  const fixedDate = new Date(2025, 5, 5); // 2025-06-05, 00:00 local time

  beforeAll(() => {
    // lastNDays rely on new Date()
    vi.setSystemTime(fixedDate);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it.concurrent.each([
    {
      input: 15,
      output: { from: "2025-05-21", to: "2025-06-05" },
    },
    {
      input: 30,
      output: { from: "2025-05-06", to: "2025-06-05" },
    },
    {
      input: 60,
      output: { from: "2025-04-06", to: "2025-06-05" },
    },
  ])("should return last $input days from ", ({ input, output }) => {
    expect(lastNDays(input)).toEqual(output);
  });
});
