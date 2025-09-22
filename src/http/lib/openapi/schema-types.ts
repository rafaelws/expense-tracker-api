import type { ZodType } from "zod";

export type SchemaRegistryUnit = {
  id: string;
  $ref: string;
  zodSchema: ZodType;
};

export type SchemaRegistry = Record<string, SchemaRegistryUnit>;
