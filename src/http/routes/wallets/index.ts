import type { FastifyPluginAsync } from "fastify";
import { httpRoute } from "@/http/lib/adapter";
import {
  deleteWallet,
  getWallets,
  postWallet,
  putWallet,
} from "./wallet-http-handlers";

const router: FastifyPluginAsync = async (router) => {
  router.get("/wallets", httpRoute(getWallets));
  router.post("/wallets", httpRoute(postWallet));

  router.put("/wallets/:id", httpRoute(putWallet));
  router.delete("/wallets/:id", httpRoute(deleteWallet));
};

export default router;
