import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // bcmenzingen.ch is currently not registered; change this if a custom domain is set up.
  site: 'https://bc-menzingen.github.io',
  output: 'static',
  trailingSlash: 'always',
  env: {
    validateSecrets: true,
    schema: {
      // Encrypted at build time, see ContactReveal.astro.
      CONTACT_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true, includes: '@' }),
      CONTACT_PHONE: envField.string({ context: 'server', access: 'secret', optional: true, startsWith: '+' }),
    },
  },
  image: { layout: 'constrained', responsiveStyles: true },
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/404') })],
  // Archive pages and the empty event pages of the WordPress site.
  redirects: {
    '/category/allgemein/': '/news/',
    '/author/kevin/': '/news/',
    '/anlaesse/': '/news/',
    '/events/': '/news/',
  },
});
