import { z } from "zod";

export const createTagSchema = z.object({
  name: z
    .string()
    .max(255)
    .trim()
    .nonempty()
    .regex(/^(?!\s*$).+/, { error: "Not allowed: Empty spaces only" })
    .meta({ examples: ["Food"] }),
  fgColor: z
    .string()
    .max(50)
    .trim()
    .nonempty()
    .regex(/^(?!\s*$).+/, { error: "Not allowed: Empty spaces only" })
    .optional()
    .meta({ examples: ["#48484e"] }),
  bgColor: z
    .string()
    .max(50)
    .trim()
    .nonempty()
    .regex(/^(?!\s*$).+/, { error: "Not allowed: Empty spaces only" })
    .optional()
    .meta({ examples: ["rgba(255,255,255,0.82)"] }),
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
