import type { FastifyPluginAsync } from "fastify";
import { httpRoute } from "@/http/lib/adapter";
import { deleteTag, getTags, postTag, putTag } from "./tag-http-handlers";

const router: FastifyPluginAsync = async (router) => {
  router.get("/tags", httpRoute(getTags));
  router.post("/tags", httpRoute(postTag));

  router.put("/tags/:id", httpRoute(putTag));
  router.delete("/tags/:id", httpRoute(deleteTag));
};

export default router;
