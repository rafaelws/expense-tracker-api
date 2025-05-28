import { TagRepository } from "@/features/tags/tag-repository";
import { CreateTagDTO, UpdateTagDTO } from "@/features/tags/tag-schema";
import { ExposableTag, TagService } from "@/features/tags/tag-service";
import { HandlerRequest, HandlerResponse } from "@/http/lib/types";

const tagService = new TagService(new TagRepository());

export async function postTag(
  req: HandlerRequest<CreateTagDTO>,
  res: HandlerResponse<ExposableTag>,
) {
  const result = await tagService.createTag(res.locals.userId, req.body);
  res.status(201).json(result);
}

export async function putTag(
  req: HandlerRequest<UpdateTagDTO>,
  res: HandlerResponse<ExposableTag>,
) {
  const result = await tagService.updateTag(
    req.params.id,
    res.locals.userId,
    req.body,
  );
  res.json(result);
}

export async function deleteTag(req: HandlerRequest, res: HandlerResponse) {
  await tagService.deleteTag(req.params.id, res.locals.userId);
  res.sendStatus(204);
}
