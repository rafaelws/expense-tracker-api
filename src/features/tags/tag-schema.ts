import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().max(255).trim().nonempty(),
  fgColor: z.string().max(50).trim().nonempty().optional(),
  bgColor: z.string().max(50).trim().nonempty().optional(),
});

export type CreateTagDTO = z.infer<typeof createTagSchema>;

export const updateTagSchema = createTagSchema
  .partial()
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message:
      "At least one of these fields must be provided: name, fgColor, bgColor",
    path: [],
  });

export type UpdateTagDTO = z.infer<typeof updateTagSchema>;
