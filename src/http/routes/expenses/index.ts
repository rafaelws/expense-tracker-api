import type { FastifyPluginAsync } from "fastify";
import { httpRoute } from "@/http/lib/adapter";
import {
  deleteExpense,
  getExpenses,
  getLatestExpenses,
  postExpense,
  putExpense,
} from "./expense-http-handlers";

const router: FastifyPluginAsync = async (router) => {
  router.post("/expenses", httpRoute(postExpense));
  router.get("/expenses", httpRoute(getExpenses));

  router.put("/expenses/:id", httpRoute(putExpense));
  router.delete("/expenses/:id", httpRoute(deleteExpense));

  router.get("/expenses/latest", httpRoute(getLatestExpenses));
};

export default router;
