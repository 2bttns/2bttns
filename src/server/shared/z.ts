import { z } from "zod";

export const textFilter = z.object({
  in: z.array(z.string()).optional(),
  contains: z.string().optional(),
});

export const tagFilter = z.object({
  include: z.array(z.string()),
  exclude: z.array(z.string()),
  includeUntagged: z.boolean().default(false),
});

export const sort = z.enum(["asc", "desc"]);

export const paginationTake = z.number().min(0).optional().default(10);
export const paginationSkip = z.number().min(0).optional().default(0);

export const booleanEnum = z
  // For some reason, z.boolean() doesn't work when setting it via the swagger docs UI; everything is registered as true
  // Hence, we use z.string() and then preprocess it to a boolean
  .preprocess((value) => {
    if (typeof value === "string") {
      return value === "true";
    }

    if (typeof value === "boolean") {
      return value;
    }

    return false;
  }, z.boolean())
  .default(false);

export const commaSeparatedStringToArray = z
  .preprocess((input) => {
    if (typeof input === "string") {
      return input.split(",");
    }
    return [];
  }, z.array(z.string()))
  .optional();
