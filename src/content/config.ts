import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
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
