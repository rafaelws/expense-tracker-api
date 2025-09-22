import { ResourceNotFoundError } from "@/lib/errors";
import { uuid } from "@/lib/uuid";

import type { WalletEntity } from "./wallet-entity";
import { type PublicWallet, toPublicWallet } from "./wallet-mapper";
import type { WalletRepository } from "./wallet-repository";
import type { CreateWalletDTO, UpdateWalletDTO } from "./wallet-schema";

export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  public async createWallet(
    userId: string,
    dto: CreateWalletDTO,
  ): Promise<PublicWallet> {
    const now = new Date();
    const entity: WalletEntity = {
      ...dto,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
      userId,
    };
    await this.walletRepository.create(entity);
    return toPublicWallet(entity);
  }

  public async updateWallet(
    id: string,
    userId: string,
    dto: UpdateWalletDTO,
  ): Promise<PublicWallet> {
    const entity = await this.walletRepository.findFirst(id, userId);
    if (!entity) throw new ResourceNotFoundError(`Wallet#${id}`);

    const toUpdate = { ...dto, updatedAt: new Date() };
    await this.walletRepository.update(id, userId, toUpdate);
    return toPublicWallet({ ...entity, ...toUpdate });
  }

  public async deleteWallet(id: string, userId: string): Promise<void> {
    const entity = await this.walletRepository.findFirst(id, userId);
    if (!entity) throw new ResourceNotFoundError(`Wallet#${id}`);

    await this.walletRepository.remove(id, userId);
  }

  public async getWallets(userId: string): Promise<{ result: PublicWallet[] }> {
    const wallets = await this.walletRepository.allWallets(userId);
    return { result: wallets.map(toPublicWallet) };
  }
}
