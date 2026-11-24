# bc-menzingen.github.io

The website of the Badmintonclub Menzingen: a static [Astro](https://astro.build) site
in German, published on GitHub Pages at <https://bcmenzingen.ch/>.

It is a rebuild of the former WordPress site from its last working captures in
the [Wayback Machine](https://web.archive.org/web/20240618234847/https://www.bcmenzingen.ch/).

## Run it locally

With [mise](https://mise.jdx.dev):

```sh
mise install && mise run install
cp .env.example .env
mise run dev    # http://localhost:4321
```

## Editing content

All texts are Markdown files with YAML frontmatter; schemas are in `src/content.config.ts`.

- `src/content/pages/`: the pages. The file name is the URL.
- `src/content/news/`: the news posts. `title` and `date` are required.
- `src/content/shared/site.md`: navigation, training times, sponsors, and labels.
  The training times are also mentioned in `src/content/pages/ueber-uns.md`.
- `src/assets/`: images, scaled and converted at build time.

## Contact details behind a captcha

Email addresses and phone numbers must never be committed. The Kontakt page gets them from
two optional GitHub Actions secrets (Settings → Secrets and variables → Actions):

```sh
gh secret set CONTACT_EMAIL
gh secret set CONTACT_PHONE   # international format, starting with +
```

Both commands prompt for the value. Rerun the workflow after changing one. The page offers
only what is set; with neither, it invites visitors to a training instead.

The build publishes the details encrypted. After a visitor confirms a dialog, the browser
solves an [ALTCHA](https://altcha.org/) proof of work that yields the key. This needs no
server, sets no cookies, and sends nothing to third parties. It stops simple scrapers, but
not a bot that runs a real browser and completes the dialog.

`mise run test` fails if an email address or phone number is in the repository or, in plain
text, in the build.

## Migration notes

- The page texts are those of the newest working capture of each page (September 2023 to
  June 2024). Later captures only show an error.
- Text, colors, logo, images, and layout are kept. WordPress, its theme, and plugins are gone.
- The Kontakt form is gone, because it needs a server.
- The invitation to the general meeting of 2019 (PDF) is not published, as it contains a
  personal email address. A local copy belongs in `archive/`, which Git ignores.
- Not recoverable: the photo on "Über uns", and the photo album linked as "Fotos" (404).
- The sponsor logo of Kevin Horat has no link, as its domain now shows a hosting provider.
- `/news/` and the posts keep their URLs; as before, the navigation does not link them.
- The empty pages `/anlaesse/` and `/events/`, and the WordPress archives
  `/category/allgemein/` and `/author/kevin/`, redirect to `/news/`.

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md): how to build, check, and submit changes.
- [AGENTS.md](AGENTS.md): instructions for AI coding agents.
- [Architecture](docs/architecture/README.md) and [decisions](docs/architecture/decisions/README.md).
