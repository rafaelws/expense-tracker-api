import type { Server } from "node:http";
import { createServer, type ServerLike } from "@/http/server";

let fastifyApp: ServerLike | null = null;

export async function getTestServer(): Promise<Server> {
  if (!fastifyApp) {
    fastifyApp = await createServer();
    await fastifyApp.ready();
  }
  return fastifyApp.server; // Node http.Server
}

export async function closeTestServer() {
  if (fastifyApp) {
    await fastifyApp.close();
    fastifyApp = null;
  }
}
