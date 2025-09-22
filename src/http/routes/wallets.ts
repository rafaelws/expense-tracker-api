import type { FastifyPluginAsync } from "fastify";
import { WalletRepository } from "@/features/wallets/wallet-repository";
import type {
  CreateWalletDTO,
  UpdateWalletDTO,
} from "@/features/wallets/wallet-schema";
import { WalletService } from "@/features/wallets/wallet-service";
import { ValidationError } from "@/lib/errors";
import { anyOfKeys } from "@/lib/util";
import { response, responses } from "../lib/openapi/schema-helper";
import { type IdParam, schemaRegistry } from "../lib/openapi/schema-registry";
import { setAuthHook } from "../middlewares/auth-hook";

const walletService = new WalletService(new WalletRepository());

const walletsRouter: FastifyPluginAsync = async (router) => {
  setAuthHook(router);

  router.get(
    "/",
    {
      schema: {
        operationId: "getWallets",
        summary: "Retrieve wallets",
        tags: ["wallets"],
        response: {
          200: response(200, schemaRegistry.wallets.many.$ref),
          ...responses(500),
        },
      },
    },
    async (req, reply) => {
      const result = await walletService.getWallets(req.userId!);
      return reply.code(200).send(result);
    },
  );

  router.post<{ Body: CreateWalletDTO }>(
    "/",
    {
      schema: {
        operationId: "createWallet",
        summary: "Create a new wallet",
        tags: ["wallets"],
        body: { $ref: schemaRegistry.wallets.create.$ref },
        response: {
          201: response(201, schemaRegistry.wallets.one.$ref),
          ...responses(400, 401, 500),
        },
      },
    },
    async (req, reply) => {
      const result = await walletService.createWallet(req.userId!, req.body);
      return reply.code(201).send(result);
    },
  );

  router.put<{ Params: IdParam; Body: UpdateWalletDTO }>(
    "/:id",
    {
      schema: {
        operationId: "updateWallet",
        summary: "Updates an existing wallet",
        tags: ["wallets"],
        params: { $ref: schemaRegistry.commons.idParam.$ref },
        body: { $ref: schemaRegistry.wallets.update.$ref },
        response: {
          200: response(200, schemaRegistry.wallets.one.$ref),
          ...responses(400, 401, 404, 500),
        },
      },
    },
    async (req, reply) => {
      if (!anyOfKeys(req.body, ["name", "bgColor", "fgColor", "sortOrder"])) {
        throw new ValidationError("At least one field should be present");
      }
      const result = await walletService.updateWallet(
        req.params.id,
        req.userId!,
        req.body,
      );
      return reply.code(200).send(result);
    },
  );

  router.delete<{ Params: IdParam }>(
    "/:id",
    {
      schema: {
        operationId: "deleteWallet",
        summary: "Deletes an existing wallet",
        tags: ["wallets"],
        params: { $ref: schemaRegistry.commons.idParam.$ref },
        response: {
          ...responses(204, 400, 401, 404, 500),
        },
      },
    },
    async (req, reply) => {
      await walletService.deleteWallet(req.params.id, req.userId!);
      return reply.code(204).send();
    },
  );
};

export default walletsRouter;

export const autoPrefix = "/wallets";
