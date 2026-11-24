---
tags: [adr]
status: accepted
date: 2026-11-24
amended-by: [0004-serve-the-site-at-bcmenzingen-ch.md]
sources:
  - package.json
  - astro.config.mjs
  - src/styles/global.css
  - .mise/config.toml
  - .github/workflows/deploy.yml
---

# 0001 — Build a static site with Astro on GitHub Pages

> Amended by [ADR 0004](0004-serve-the-site-at-bcmenzingen-ch.md): the domain is registered
> again, and the site is served there instead of at the github.io address.

## Context

The club's WordPress site is offline and its domain no longer resolves. A replacement should
need no server or maintenance of a CMS. The content is small: a few pages and news posts
that change rarely.

Alternatives considered:

- **WordPress again.** Editing in the browser and a working contact form, but a server, a
  database, and updates to look after.
- **Plain HTML and CSS.** No toolchain, but every page would repeat the header, the training
  times, and the footer by hand.
- **Astro**, as in the related Konzeptholz site: components, typed Markdown content, image
  optimization, and static output by default.

## Decision

Build the site with Astro 7 into static files in `dist/`, with plain CSS in one stylesheet:
the former theme is simple, and a CSS framework would add more than it saves. The font
Oswald is bundled from Fontsource. [.mise/config.toml](../../../.mise/config.toml) pins
Node.js, mise tasks wrap the npm scripts, and Prettier formats the sources.

[deploy.yml](../../../.github/workflows/deploy.yml) checks pull requests and deploys `main`
to GitHub Pages.

## Consequences

- No server, database, cookies, or third-party requests.
- No contact form, as it needs a server. See
  [ADR 0003](0003-show-contact-details-behind-a-captcha.md) for the replacement.
- Editing needs Git and Markdown instead of a CMS.
- Without `configure-pages`, the site URL is set in `astro.config.mjs`, and internal links
  only work at the root of a domain. This fits an organization site or a custom domain.
- GitHub Pages must use "GitHub Actions" as its source in the repository settings.

## The tell

- `mise run check` passes: Prettier, `astro check`, `astro build`, and the tests.
- `rg -n '<form|https?://' src --glob '!content.config.ts'` finds no form and no URL that the
  browser loads by itself; links to sponsors are fine. `tests/browser-check.js` fails on
  third-party requests of the pages it visits.
- The Node.js version in `.mise/config.toml` satisfies `engines.node` of `astro` in
  `package-lock.json`; review both when updating either.
