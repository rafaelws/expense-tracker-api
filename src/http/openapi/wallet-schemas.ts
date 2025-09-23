import z from "zod";
import { publicWalletSchema } from "@/features/wallets/wallet-mapper";
import {
  createWalletSchema,
  updateWalletSchema,
} from "@/features/wallets/wallet-schema";
import type { SchemaRegistry } from "./schema-types";

export const walletSchemas: SchemaRegistry = {
  one: {
    id: "Wallet",
    $ref: "Wallet#",
    zodSchema: publicWalletSchema,
  },
  many: {
    id: "WalletList",
    $ref: "WalletList#",
    zodSchema: z.object({ result: z.array(publicWalletSchema) }),
  },
  create: {
    id: "CreateWallet",
    $ref: "CreateWallet#",
    zodSchema: createWalletSchema,
  },
  update: {
    id: "UpdateWallet",
    $ref: "UpdateWallet#",
    zodSchema: updateWalletSchema,
  },
} as const;
