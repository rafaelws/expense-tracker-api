import { ResourceNotFoundError } from "@/lib/errors";
import { pick } from "@/lib/util";
import { uuid } from "@/lib/uuid";

import { TagEntity } from "./tag-entity";
import { TagRepository } from "./tag-repository";
import { CreateTagDTO, UpdateTagDTO } from "./tag-schema";

// : (keyof TagEntity)[]
const exposableFields = ["id", "name", "fgColor", "bgColor"] as const;

export type ExposableTag = Pick<TagEntity, (typeof exposableFields)[number]>;

const expose = (entity: TagEntity) => pick(entity, exposableFields);

export class TagService {
  constructor(private readonly tagRepository: TagRepository) {}

  public async createTag(
    userId: string,
    dto: CreateTagDTO,
  ): Promise<ExposableTag> {
    const now = new Date();
    const entity: TagEntity = {
      ...dto,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
      userId,
    };
    await this.tagRepository.create(entity);
    return expose(entity);
  }

  public async updateTag(
    id: string,
    userId: string,
    dto: UpdateTagDTO,
  ): Promise<ExposableTag> {
    const entity = await this.tagRepository.findFirst(id, userId);
    if (!entity) throw new ResourceNotFoundError(`Tag#${id}`);

    const toUpdate = { ...dto, updatedAt: new Date() };
    await this.tagRepository.update(id, userId, toUpdate);
    return expose({ ...entity, ...toUpdate });
  }

  public async deleteTag(id: string, userId: string): Promise<void> {
    const entity = await this.tagRepository.findFirst(id, userId);
    if (!entity) throw new ResourceNotFoundError(`Tag#${id}`);

    await this.tagRepository.remove(id, userId);
  }
}
