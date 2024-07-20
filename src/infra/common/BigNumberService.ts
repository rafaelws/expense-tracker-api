import Big from "big.js";

import { BigNumber } from "@/features/common";

export const bigNumberService = {
  gt(greater, than) {
    return Big(greater).gt(than);
  },
  lte(lessOrEqual, than) {
    return Big(lessOrEqual).lte(than);
  },
} satisfies BigNumber;
