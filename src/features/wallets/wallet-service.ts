import { ResourceNotFoundError } from "@/lib/errors";
import { uuid } from "@/lib/uuid";

import { WalletEntity } from "./wallet-entity";
import { PublicWallet, toPublicWallet } from "./wallet-mapper";
import { WalletRepository } from "./wallet-repository";
import { CreateWalletDTO, UpdateWalletDTO } from "./wallet-schema";

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
}
