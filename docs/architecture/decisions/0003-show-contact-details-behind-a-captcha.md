---
tags: [adr]
status: accepted
date: 2026-11-24
sources:
  - src/components/ContactReveal.astro
  - astro.config.mjs
  - .github/workflows/deploy.yml
  - tests/site.test.mjs
---

# 0003 — Show contact details only behind a captcha

## Context

Without the contact form, visitors need another way to reach the club. The repository and
the site are public, so an email address or phone number in either is open to scrapers, and
in the Git history for good.

Alternatives considered:

- **A hosted form or captcha service.** Sends visitors' data to a third party and needs an
  account.
- **Obfuscation with JavaScript or CSS.** Simple, but trivial to undo, and the details would
  be in the repository.
- **Encryption with an [ALTCHA](https://altcha.org/) proof of work**, as on the Konzeptholz
  site: static, and without third parties.

## Decision

Keep the details in the GitHub Actions secrets `CONTACT_EMAIL` and `CONTACT_PHONE`, and
encrypt them at build time with `altcha-lib`. After a confirmation dialog the browser finds
the key by proof of work and shows them. Both secrets are optional: the archived pages had
no contact details to take over, so the Kontakt page offers only what is set, and an
invitation to a training otherwise.

Local builds use the dummy values of [.env.example](../../../.env.example).

## Consequences

- Nothing is stored or sent to third parties, and no cookies are set.
- It stops simple scrapers, but not a bot that runs a real browser and completes the dialog.
- The details need JavaScript and a secure context; a `noscript` text says so. Finding the
  key takes about a second on a desktop, longer on slow phones.
- Changing a secret takes effect with the next run of the workflow.
- A missing secret does not fail the build, so nobody notices it there.

## The tell

- `mise run test` fails if an email address, phone number, or document is in the repository
  or, in plain text, in the build, or if the Kontakt page does not carry the configured
  details. It covers neither image metadata nor Git history.
- `mise run test-browser` checks that cancelled and failed captchas reveal nothing.
