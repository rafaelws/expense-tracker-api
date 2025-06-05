import { PublicWallet } from "@/features/wallets/wallet-mapper";
import { WalletRepository } from "@/features/wallets/wallet-repository";
import {
  CreateWalletDTO,
  UpdateWalletDTO,
} from "@/features/wallets/wallet-schema";
import { WalletService } from "@/features/wallets/wallet-service";
import { HandlerRequest, HandlerResponse } from "@/http/lib/types";

const walletService = new WalletService(new WalletRepository());

export async function postWallet(
  req: HandlerRequest<CreateWalletDTO>,
  res: HandlerResponse<PublicWallet>,
) {
  const result = await walletService.createWallet(res.locals.userId, req.body);
  res.status(201).json(result);
}

export async function putWallet(
  req: HandlerRequest<UpdateWalletDTO>,
  res: HandlerResponse<PublicWallet>,
) {
  const result = await walletService.updateWallet(
    req.params.id,
    res.locals.userId,
    req.body,
  );
  res.status(200).json(result);
}

export async function deleteWallet(req: HandlerRequest, res: HandlerResponse) {
  await walletService.deleteWallet(req.params.id, res.locals.userId);
  res.sendStatus(204);
}

export async function getWallets(
  _: HandlerRequest,
  res: HandlerResponse<Array<PublicWallet>>,
) {
  const result = await walletService.getWallets(res.locals.userId);
  res.status(200).json(result);
}
