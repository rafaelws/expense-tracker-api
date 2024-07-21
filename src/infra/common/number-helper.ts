import BigNumber from "bignumber.js";

import { BigNumber as Contract } from "@/features/common";

export const numberHelper = {
  gt(greater, than) {
    return BigNumber(greater).gt(than);
  },
  lte(lessOrEqual, than) {
    return BigNumber(lessOrEqual).lte(than);
  },
  isValid(n) {
    const big = BigNumber(n);
    return !big.isNaN() && big.isFinite();
  },
} satisfies Contract;
