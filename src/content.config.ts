import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['design', 'architecture', 'agents', 'systems']).default('design'),
    tags: z.array(z.string()).default([]),
    publishedDate: z.string().optional(),
    agentRulesSummary: z.string().optional(),
  })
});

export const collections = { docs };
