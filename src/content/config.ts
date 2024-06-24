import { defineCollection, z } from "astro:content";
import { getUrlWithBase } from "../utils";
import { DEFAULT_OG } from "../consts";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    heroImage: z.string().optional().default(getUrlWithBase(DEFAULT_OG)),
    postType: z.enum(["security", "programming", "hacking", "terms", "osint"]),
    tags: z
      .array(
        z
          .string()
          .refine((s) => !s.includes(" "), "tag no must be contains space")
      )
      .max(5),
  }),
});

export const collections = { blog };
