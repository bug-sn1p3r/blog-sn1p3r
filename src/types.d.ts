import type { MarkdownHeading } from "astro";

export type MarkdownHeadingWithSubs = MarkdownHeading & {
  subheadings: MarkdownHeadingWithSubs[];
};

export interface PostMetadata {
  index: number;
  title: string;
  description: string;
  slug: string;
  postType: string;
  tags: string[];
  date: Date;
}
