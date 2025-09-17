import type { FastifyPluginAsync } from "fastify";
import { httpRoute } from "@/http/lib/adapter";
import { postAuthenticate, postUser } from "./user-http-handlers";

const router: FastifyPluginAsync = async (router) => {
  router.post("/users", httpRoute(postUser));
  router.post("/auth", httpRoute(postAuthenticate));
};
export default router;
