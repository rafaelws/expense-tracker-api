import { PublicTag } from "@/features/tags/tag-mapper";
import { TagRepository } from "@/features/tags/tag-repository";
import { CreateTagDTO, UpdateTagDTO } from "@/features/tags/tag-schema";
import { TagService } from "@/features/tags/tag-service";
import { HandlerRequest, HandlerResponse } from "@/http/lib/types";

const tagService = new TagService(new TagRepository());

export async function postTag(
  req: HandlerRequest<CreateTagDTO>,
  res: HandlerResponse<PublicTag>,
) {
  const result = await tagService.createTag(res.locals.userId, req.body);
  res.status(201).json(result);
}

export async function putTag(
  req: HandlerRequest<UpdateTagDTO>,
  res: HandlerResponse<PublicTag>,
) {
  const result = await tagService.updateTag(
    req.params.id,
    res.locals.userId,
    req.body,
  );
  res.status(200).json(result);
}

export async function deleteTag(req: HandlerRequest, res: HandlerResponse) {
  await tagService.deleteTag(req.params.id, res.locals.userId);
  res.sendStatus(204);
}
