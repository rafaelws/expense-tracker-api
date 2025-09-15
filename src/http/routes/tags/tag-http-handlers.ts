import { TagRepository } from "@/features/tags/tag-repository";
import { createTagSchema, updateTagSchema } from "@/features/tags/tag-schema";
import { TagService } from "@/features/tags/tag-service";
import { auth } from "@/http/lib/auth";
import { type HttpRequest, reply } from "@/http/lib/types";
import { validate } from "@/http/lib/validate";

const tagService = new TagService(new TagRepository());

export async function postTag({ headers, body }: HttpRequest) {
  const userId = auth(headers);
  const dto = validate(body, createTagSchema);
  const result = await tagService.createTag(userId, dto);
  return reply(201, result);
}

export async function getTags({ headers }: HttpRequest) {
  const userId = auth(headers);
  const result = await tagService.getTags(userId);
  return reply(200, result);
}

export async function putTag({ headers, params, body }: HttpRequest) {
  const userId = auth(headers);
  const dto = validate(body, updateTagSchema);

  const result = await tagService.updateTag(params.id, userId, dto);
  return reply(200, result);
}

export async function deleteTag({ params, headers }: HttpRequest) {
  const userId = auth(headers);
  await tagService.deleteTag(params.id, userId);
  return reply(204);
}
