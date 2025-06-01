import { describe, expect, it } from "vitest";

import { TagEntity } from "@/features/tags/tag-entity";
import { toPublicTag } from "@/features/tags/tag-mapper";
import { uuid } from "@/lib/uuid";

describe("toPublicTag", () => {
  it("should return only exposable fields from TagEntity", () => {
    const entity: TagEntity = {
      id: uuid(),
      name: "Food",
      fgColor: "#fff",
      bgColor: "#000",
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: uuid(),
    };

    const result = toPublicTag(entity);

    expect(result).toEqual({
      id: entity.id,
      name: "Food",
      fgColor: "#fff",
      bgColor: "#000",
    });

    // @ts-expect-error - should not exist in result
    expect(result.userId).toBeUndefined();
    // @ts-expect-error - should not exist in result
    expect(result.createdAt).toBeUndefined();
  });
});
