import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({ title: z.string(), description: z.string() }),
});
const news = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/news' }),
  schema: z.object({ title: z.string(), date: z.coerce.date() }),
});
const shared = defineCollection({
  loader: glob({ pattern: 'site.md', base: './src/content/shared' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    logo: image(),
    nav: z.array(z.object({
      label: z.string(), href: z.string(),
      children: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    })),
    sponsors: z.array(z.object({ name: z.string(), image: image(), href: z.url().optional() })),
    training: z.object({ title: z.string(), times: z.array(z.string()), place: z.string(), address: z.string() }),
    welcome: z.object({ title: z.string(), text: z.string() }),
    sponsorsTitle: z.string(),
    labels: z.object({ skip: z.string(), menu: z.string(), nav: z.string(), published: z.string(), newsNav: z.string() }),
    contact: z.object({
      showEmail: z.string(), showPhone: z.string(), noneAvailable: z.string(),
      title: z.string(), hint: z.string(), confirm: z.string(), checking: z.string(),
      error: z.string(), close: z.string(), noscript: z.string(),
    }),
  }),
});
export const collections = { pages, news, shared };
