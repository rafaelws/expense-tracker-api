import { describe, expect, it } from "vitest";

import { monthInterval } from "@/features/expenses/expense-interval";

describe("expense-interval.monthInterval", () => {
  it.concurrent.each([
    {
      input: "2025-06",
      output: { from: "2025-06-01", to: "2025-06-30" },
    },
    {
      input: "2024-02",
      output: { from: "2024-02-01", to: "2024-02-29" },
    },
    {
      input: "2024-12",
      output: { from: "2024-12-01", to: "2024-12-31" },
    },
  ])(
    "should return month interval (first and last day of a given month) for $input",
    ({ input, output }) => {
      expect(monthInterval(input)).toEqual(output);
    },
  );
});
