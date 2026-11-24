# Working on bc-menzingen.github.io

The website of the Badmintonclub Menzingen, at <https://bc-menzingen.github.io/>. It is a
static rebuild of the former WordPress site bcmenzingen.ch, built with Astro 7 and plain
CSS. Use the versions pinned in `package-lock.json`.

## Start here

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [README.md](README.md) before changing code.

- `src/content/` and `src/content.config.ts`: German Markdown files for pages, news, and
  shared texts (navigation, training times, sponsors, labels), with their schemas.
- `src/pages/`: page templates. `[slug].astro` renders pages, `[post].astro` news posts.
- `src/layouts/Site.astro`: header, navigation, sidebar, and footer of every page.
- `src/components/Post.astro`: a news post, on its own page and in the list.
- `src/components/ContactReveal.astro`: the encrypted contact details and their captcha.
- `src/styles/global.css`: all styles.
- `src/assets/`: images that Astro optimizes. `public/`: files published unchanged.
- `astro.config.mjs`: site URL, secrets, and redirects of old URLs.
- `tests/`: `site.test.mjs` checks the repository and the build, `browser-check.js` the
  pages in a browser.
- `.github/workflows/deploy.yml`: checks on pull requests and GitHub Pages on `main`.

## Contact details

Never write an email address or phone number into a file of this repository, a commit
message, a pull request, or a log; neither real ones nor plausible ones. This includes PDFs
and image metadata. Use the dummy values of `.env.example`. The real values are GitHub
Actions secrets, and the site shows them only behind the captcha; see
[README.md](README.md#contact-details-behind-a-captcha).

`archive/` is ignored by Git because its documents contain personal contact details. Do not
commit, publish, or transcribe them.

## Architecture and scope

Keep the site static: no server, no client-side framework, no third-party requests, and
JavaScript only where a feature cannot work without it. There is no contact form, because
it needs a server.

Write all site text in German with Swiss spelling ("ss", not "ß"), and address visitors
with "du". Keep the texts of the former site as they are unless asked; do not invent facts
about the club. Keep the existing URLs, and add a redirect when one has to change.

## Editing and validation

Follow nearby code. Keep changes focused, preserve existing user changes, and avoid
unrelated formatting or dependency upgrades. Keep `package-lock.json` committed, install
with `npm ci`, and do not edit `dist/`, `.astro/`, or `node_modules/`.

Follow the [contribution checks](CONTRIBUTING.md#setup-and-validation). For code or content
changes, run `npm run check`, `npm run build`, and `npm test`. Verify visual changes in a
browser at desktop and phone widths. Do not claim a successful build proves a page looks
right.

Documentation-only changes need source and relative-link checks plus `git diff --check` and
`npm test`, not a visual check. Report actual checks, failures, and unavailable coverage.
Follow the contribution rules for branches, Conventional Commits, and pull requests.
