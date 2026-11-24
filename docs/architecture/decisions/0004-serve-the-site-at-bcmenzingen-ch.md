---
tags: [adr]
status: accepted
date: 2026-11-24
amends: [0001-build-a-static-site-with-astro.md]
sources:
  - astro.config.mjs
  - tests/site.test.mjs
---

# 0004 — Serve the site at bcmenzingen.ch

## Context

The former site's domain had lapsed, so the rebuilt site was prepared for
`bc-menzingen.github.io`. The domain is registered again, with DNS at Infomaniak, and
verified for the GitHub organization. GitHub Pages redirects the github.io address once a
custom domain is set.

Alternatives considered:

- **Keep bc-menzingen.github.io.** No DNS to look after, but old links stay dead.
- **`www.bcmenzingen.ch` as the main address**, as on the former site. Robust behind a
  single CNAME record, but longer.
- **`bcmenzingen.ch` as the main address.** Short; needs A and AAAA records with GitHub's
  addresses.

## Decision

Serve the site at `https://bcmenzingen.ch`. The domain is set in the Pages settings of the
repository; `site` in [astro.config.mjs](../../../astro.config.mjs) makes canonical URLs, the
sitemap, and `robots.txt` match. There is no `CNAME` file, as GitHub ignores it when a
workflow deploys the site.

The DNS zone needs these records, see
[GitHub's documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site):

| Name | Type | Value |
| --- | --- | --- |
| `bcmenzingen.ch` | A | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `bcmenzingen.ch` | AAAA | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| `www.bcmenzingen.ch` | CNAME | `bc-menzingen.github.io` |
| `_github-pages-challenge-bc-menzingen` | TXT | the organization's verification code; keep it |

## Consequences

- Old links to `www.bcmenzingen.ch` pages work again: GitHub redirects `www` to the main
  address, and the paths are unchanged.
- The site is unreachable, also at the github.io address, while the A and AAAA records are
  missing or the domain lapses.
- GitHub issues the certificate only after the records are in place; "Enforce HTTPS" in the
  Pages settings has to be switched on afterwards. The captcha needs HTTPS.
- The domain and its DNS zone have to be renewed and kept outside this repository.

## The tell

- `mise run test` checks canonical URLs, sitemap, and `robots.txt` against this domain.
- `gh api repos/bc-menzingen/bc-menzingen.github.io/pages` shows `cname` as
  `bcmenzingen.ch` and `https_enforced` as `true`. Neither proves that DNS is correct;
  `gh api repos/bc-menzingen/bc-menzingen.github.io/pages/health` checks the records.
