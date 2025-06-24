import { Router } from "express";

import { httpRoute } from "@/http/lib/adapter";

import {
  deleteWallet,
  getWallets,
  postWallet,
  putWallet,
} from "./wallet-http-handlers";

export const walletsRouter = Router();

walletsRouter
  .route("/wallets")
  .get(httpRoute(getWallets))
  .post(httpRoute(postWallet));

walletsRouter
  .route("/wallets/:id")
  .put(httpRoute(putWallet))
  .delete(httpRoute(deleteWallet));
