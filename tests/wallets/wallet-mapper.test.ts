import { describe, expect, it } from "vitest";

import type { WalletEntity } from "@/features/wallets/wallet-entity";
import { toPublicWallet } from "@/features/wallets/wallet-mapper";
import { uuid } from "@/lib/uuid";

describe("toPublicWallet", () => {
  it("should return only exposable fields from WalletEntity", () => {
    const entity: WalletEntity = {
      id: uuid(),
      name: "Main Wallet",
      fgColor: "#ccc",
      bgColor: "#333",
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: uuid(),
    };

    const result = toPublicWallet(entity);

    expect(result).toEqual({
      id: entity.id,
      name: "Main Wallet",
      fgColor: "#ccc",
      bgColor: "#333",
      sortOrder: 2,
    });

    // @ts-expect-error - should not exist in result
    expect(result.userId).toBeUndefined();
    // @ts-expect-error - should not exist in result
    expect(result.createdAt).toBeUndefined();
  });
});
