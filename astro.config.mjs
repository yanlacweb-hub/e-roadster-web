import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://e-roadster.fr',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/test-gpt-') && !page.includes('/test-claude-'),
    }),
  ],
});
