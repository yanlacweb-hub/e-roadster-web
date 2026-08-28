import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    postSlug: z.string(),
    date: z.string(),
    modified: z.string().optional(),
    description: z.string().optional().default(''),
    category: z.string().optional().default(''),
    categories: z.array(z.string()).optional().default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional().default(''),
    author: z.string().optional().default('e-roadster.'),
    draft: z.boolean().optional().default(false),
    outdated: z.boolean().optional().default(false),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    postSlug: z.string(),
    description: z.string().optional().default(''),
  }),
});

export const collections = { posts, pages };
