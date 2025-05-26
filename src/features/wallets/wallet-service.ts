import { ResourceNotFoundError } from "@/lib/errors";
import { pick } from "@/lib/util";
import { uuid } from "@/lib/uuid";

import { WalletEntity } from "./wallet-entity";
import { WalletRepository } from "./wallet-repository";
import { CreateWalletDTO, UpdateWalletDTO } from "./wallet-schema";

const exposableWalletFields: (keyof WalletEntity)[] = [
  "id",
  "name",
  "fgColor",
  "bgColor",
  "sortOrder",
] as const;

export type ExposableWallet = Pick<
  WalletEntity,
  (typeof exposableWalletFields)[number]
>;

const expose = (entity: WalletEntity) => pick(entity, exposableWalletFields);

export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  public async createWallet(
    userId: string,
    dto: CreateWalletDTO,
  ): Promise<ExposableWallet> {
    const now = new Date();
    const entity: WalletEntity = {
      ...dto,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
      userId,
    };
    await this.walletRepository.create(entity);
    return expose(entity);
  }

  public async updateWallet(
    id: string,
    userId: string,
    dto: UpdateWalletDTO,
  ): Promise<ExposableWallet> {
    const entity = await this.walletRepository.findFirst(id, userId);
    if (!entity) throw new ResourceNotFoundError(`Wallet#${id}`);

    const toUpdate = { ...dto, updatedAt: new Date() };
    await this.walletRepository.update(id, userId, toUpdate);
    return expose({ ...entity, ...toUpdate });
  }

  public async deleteWallet(id: string, userId: string): Promise<void> {
    const entity = await this.walletRepository.findFirst(id, userId);
    if (!entity) throw new ResourceNotFoundError(`Wallet#${id}`);

    await this.walletRepository.remove(id, userId);
  }
}
