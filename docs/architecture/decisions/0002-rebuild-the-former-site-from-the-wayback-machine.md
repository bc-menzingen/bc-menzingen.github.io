---
tags: [adr]
status: accepted
date: 2026-11-24
sources:
  - src/content/
  - src/assets/
  - src/styles/global.css
  - astro.config.mjs
---

# 0002 — Rebuild the former site from the Wayback Machine

## Context

bcmenzingen.ch was not available as a source anymore. The
[Wayback Machine](https://web.archive.org/web/20240618234847/https://www.bcmenzingen.ch/)
holds its pages and most images. The newest captures of the home page, from September 2024
on, only show an error.

Alternatives considered:

- **Publish the archived HTML.** Closest to the original, but with dead WordPress scripts
  and markup that nobody can maintain.
- **Redesign the site and rewrite its texts.** Needs decisions and facts from the club.
- **Keep content and look, replace the technology.**

## Decision

Take the newest working capture of each page, from September 2023 to June 2024. Keep its
text, URL, images, and look, and write it as Markdown and Astro templates. Deviate only where
the original cannot work:

- The contact form is gone ([ADR 0001](0001-build-a-static-site-with-astro.md)).
- The menu entry "Fotos" is gone, as its album no longer exists, and so is the link on a
  sponsor's logo whose domain shows a hosting provider.
- The empty event pages and the WordPress archives redirect to `/news/`.
- The invitation to the general meeting of 2019, a PDF with a personal email address, is not
  published. `archive/`, ignored by Git, is the place for a local copy.

## Consequences

- Facts such as the board, the number of members, and the training times are as old as the
  captures, until the club confirms or updates them.
- The photo on "Über uns" was never archived and is missing.
- `/news/` and its posts stay reachable, but unlinked in the navigation as in the original.

## The tell

- `mise run test` checks that every original page and post exists at its URL, that old
  archive URLs redirect, and that no document is published.
- Compare changed texts with the captures in review; no check detects invented facts.
