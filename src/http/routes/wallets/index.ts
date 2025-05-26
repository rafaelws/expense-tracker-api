import { Router } from "express";

import {
  createWalletSchema,
  updateWalletSchema,
} from "@/features/wallets/wallet-schema";
import { ensureAuthenticated } from "@/http/middlewares/ensure-authenticated-middleware";
import { ensureBodySchema } from "@/http/middlewares/ensure-schema-middleware";

import { deleteWallet, postWallet, putWallet } from "./wallet-http-handlers";

export const walletsRouter = Router();

walletsRouter
  .route("/wallets")
  .all(ensureAuthenticated)
  .post(ensureBodySchema(createWalletSchema), postWallet);

walletsRouter
  .route("/wallets/:id")
  .all(ensureAuthenticated)
  .put(ensureBodySchema(updateWalletSchema), putWallet)
  .delete(deleteWallet);
