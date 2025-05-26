import { Response } from "express";

import { WalletRepository } from "@/features/wallets/wallet-repository";
import {
  CreateWalletDTO,
  UpdateWalletDTO,
} from "@/features/wallets/wallet-schema";
import { WalletService } from "@/features/wallets/wallet-service";
import { HandlerRequest } from "@/http/lib/types";

const walletService = new WalletService(new WalletRepository());

export async function postWallet(
  req: HandlerRequest<CreateWalletDTO>,
  res: Response,
) {
  const result = await walletService.createWallet(req.userId!, req.body);
  return res.status(201).json(result);
}

export async function putWallet(
  req: HandlerRequest<UpdateWalletDTO>,
  res: Response,
) {
  const result = await walletService.updateWallet(
    req.params.id,
    req.userId!,
    req.body,
  );
  return res.status(200).json(result);
}

export async function deleteWallet(req: HandlerRequest, res: Response) {
  await walletService.deleteWallet(req.params.id, req.userId!);
  return res.sendStatus(204);
}
