import { ResourceNotFoundError } from "@/lib/errors";
import { uuid } from "@/lib/uuid";

import { TagEntity } from "./tag-entity";
import { PublicTag, toPublicTag } from "./tag-mapper";
import { TagRepository } from "./tag-repository";
import { CreateTagDTO, UpdateTagDTO } from "./tag-schema";

export class TagService {
  constructor(private readonly tagRepository: TagRepository) {}

  public async createTag(
    userId: string,
    dto: CreateTagDTO,
  ): Promise<PublicTag> {
    const now = new Date();
    const entity: TagEntity = {
      ...dto,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
      userId,
    };
    await this.tagRepository.create(entity);
    return toPublicTag(entity);
  }

  public async updateTag(
    id: string,
    userId: string,
    dto: UpdateTagDTO,
  ): Promise<PublicTag> {
    const entity = await this.tagRepository.findFirst(id, userId);
    if (!entity) throw new ResourceNotFoundError(`Tag#${id}`);

    const toUpdate = { ...dto, updatedAt: new Date() };
    await this.tagRepository.update(id, userId, toUpdate);
    return toPublicTag({ ...entity, ...toUpdate });
  }

  public async deleteTag(id: string, userId: string): Promise<void> {
    const entity = await this.tagRepository.findFirst(id, userId);
    if (!entity) throw new ResourceNotFoundError(`Tag#${id}`);

    await this.tagRepository.remove(id, userId);
  }
}
