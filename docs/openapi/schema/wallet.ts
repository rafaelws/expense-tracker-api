import { publicWalletSchema } from "@/features/wallets/wallet-mapper";
import {
  createWalletSchema,
  updateWalletSchema,
} from "@/features/wallets/wallet-schema";

export const walletSchemas = {
  Wallet: publicWalletSchema,
  CreateWalletRequest: createWalletSchema,
  // CreateWalletResponse: publicWalletSchema,
  UpdateWalletRequest: updateWalletSchema,
  // UpdateWalletResponse: publicWalletSchema,
};
