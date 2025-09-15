import { WalletRepository } from "@/features/wallets/wallet-repository";
import {
  createWalletSchema,
  updateWalletSchema,
} from "@/features/wallets/wallet-schema";
import { WalletService } from "@/features/wallets/wallet-service";
import { auth } from "@/http/lib/auth";
import { type HttpRequest, reply } from "@/http/lib/types";
import { validate } from "@/http/lib/validate";

const walletService = new WalletService(new WalletRepository());

export async function postWallet({ headers, body }: HttpRequest) {
  const userId = auth(headers);
  const dto = validate(body, createWalletSchema);
  const result = await walletService.createWallet(userId, dto);
  return reply(201, result);
}

export async function putWallet({ headers, params, body }: HttpRequest) {
  const userId = auth(headers);
  const dto = validate(body, updateWalletSchema);
  const result = await walletService.updateWallet(params.id, userId, dto);
  return reply(200, result);
}

export async function deleteWallet({ headers, params }: HttpRequest) {
  const userId = auth(headers);
  await walletService.deleteWallet(params.id, userId);
  return reply(204);
}

export async function getWallets({ headers }: HttpRequest) {
  const userId = auth(headers);
  const result = await walletService.getWallets(userId);
  return reply(200, result);
}
