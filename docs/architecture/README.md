# Architecture

A static website built with Astro 7 and plain CSS
([ADR 0001](decisions/0001-build-a-static-site-with-astro.md)) and published on GitHub
Pages at <https://bcmenzingen.ch/>
([ADR 0004](decisions/0004-serve-the-site-at-bcmenzingen-ch.md)). It rebuilds the former
WordPress site ([ADR 0002](decisions/0002-rebuild-the-former-site-from-the-wayback-machine.md)).
All text is German, written with Swiss spelling ("ss", not "ß"). See
[CONTRIBUTING.md](../../CONTRIBUTING.md) for checks.

## Content

Markdown files with YAML frontmatter, validated by `src/content.config.ts`:

| Path | Contents |
| --- | --- |
| `src/content/pages/` | One file per page; the file name is the URL. `startseite`, `news`, and `404` have their own template |
| `src/content/news/` | One file per news post, with `title` and `date`; the file name is the URL |
| `src/content/shared/site.md` | Navigation, training times, sponsors, and interface labels |
| `src/assets/` | Images, scaled and converted to WebP at build time |
| `public/` | Files published unchanged: the favicon |

### Adding a page or a news post

Add a Markdown file to `src/content/pages/` or `src/content/news/`. File names must be unique
across both directories, as both are published at `/<file name>/`. Add a page to `nav` in
`site.md` to link it, and every new route to `routes` in `tests/site.test.mjs`.

## Templates

| Path | Purpose |
| --- | --- |
| `src/layouts/Site.astro` | HTML shell, header, navigation, training times, and footer of every page |
| `src/components/Post.astro` | A news post, on its own page and in the list |
| `src/components/ContactReveal.astro` | Contact details on the Kontakt page |
| `src/styles/global.css` | All styles; colors and geometry follow the former theme |

The only scripts are the menu toggle on narrow screens and the contact details. Without
JavaScript the menu stays open. The submenu is always visible on narrow and touch screens,
and drops down on hover or focus otherwise.

## Contact details

Described in [ADR 0003](decisions/0003-show-contact-details-behind-a-captcha.md).

1. GitHub Actions passes the secrets `CONTACT_EMAIL` and `CONTACT_PHONE` to the build.
   `astro.config.mjs` declares and validates both; both are optional.
2. `ContactReveal.astro` encrypts them and puts the result into `data-contact`. Without any
   details it renders a sentence instead.
3. After the visitor confirms the dialog, the browser finds the key by proof of work,
   decrypts the details, and turns the placeholders into links.

`tests/site.test.mjs` rejects email addresses, phone numbers, and documents in the repository
and, in plain text, in the build. It checks neither image metadata nor Git history.

## Routes

| Route | Source |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/ueber-uns/`, `/vorstand/`, `/kontakt/` | `src/pages/[slug].astro` |
| `/news/` | `src/pages/news.astro`, not linked in the navigation |
| `/<post>/` | `src/pages/[post].astro` |
| `/404.html` | `src/pages/404.astro` |
| `/category/allgemein/`, `/author/kevin/`, `/anlaesse/`, `/events/` | redirects to `/news/` in `astro.config.mjs` |
| `/robots.txt`, `/sitemap-index.xml` | `src/pages/robots.txt.ts`, `@astrojs/sitemap` |

Internal links start at `/`: the site must be served from the root of its domain. If the
domain changes, change `site` in `astro.config.mjs` and `origin` in `tests/site.test.mjs`.

## Build and deployment

`.mise/config.toml` pins Node.js, and the tasks in `.mise/tasks/` wrap the npm scripts.
[deploy.yml](../../.github/workflows/deploy.yml) runs `mise run check` on every pull request
and push to `main`, and publishes `dist/` from `main`. The domain is set in the Pages settings
of the repository, and its DNS zone is at Infomaniak.
