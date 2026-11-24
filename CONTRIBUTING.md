# Contributing

Keep changes focused and explain the problem, resulting behavior, and validation in the
pull request. Start with the [architecture documentation](docs/architecture/README.md) and
[architectural decision records](docs/architecture/decisions/README.md). AI coding agents also
follow [AGENTS.md](AGENTS.md).

## Contact details

Email addresses and phone numbers do not belong in this public repository, including its
history: not in text, PDFs, image metadata, commit messages, or pull requests. Set them as
GitHub Actions secrets, see [README.md](README.md#contact-details-behind-a-captcha). Before
adding a photo or a document, remove its metadata and check it for such details. Commit with
your GitHub noreply address if your own should not become public.

## Branches and commits

Use short-lived branches and reviewed pull requests to `main`. Prefer `feature/<slug>` or
`bugfix/<slug>`, including an issue ID when useful. Link the relevant issue and use a draft
pull request for early feedback.

Use Conventional Commits: `<type>[optional scope][!]: <description>`. Common types are
`feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, and `chore`. Use a concise
description and separate optional bodies and footers with blank lines. Mark breaking changes
with `!` or a `BREAKING CHANGE:` footer. Squash commit messages follow the same convention.

```text
feat(news): announce the general meeting
fix(contact): restore focus after closing the captcha
docs: describe the deployment
```

## Setup and validation

Install [mise](https://mise.jdx.dev), then run from the repository root:

```sh
mise install            # Node.js as pinned in .mise/config.toml
mise run install        # npm ci: dependencies exactly as in package-lock.json
cp .env.example .env    # dummy contact details
mise run dev            # http://localhost:4321 with live reload
```

`mise tasks` lists every task; those for the site wrap an npm script in
[package.json](package.json), so mise stays optional. Keep dependency and Node.js changes
deliberate, update `package.json` and `package-lock.json` together, and explain such changes
in the pull request. To use Claude Code, run `mise run agents:init-claude` once to link
`CLAUDE.md` to `AGENTS.md`.

Run for code and content changes:

```sh
mise run check
```

which runs:

```sh
prettier --check .
astro check
astro build
npm test            # links, URLs, and no contact details in the repository or dist/
```

`mise run fmt` applies Prettier. Project Markdown in the repository root and `docs/` keeps its
hand-wrapped style and is not formatted.

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) runs `mise run check` on every
pull request and push to `main`. A push to `main` also publishes `dist/` to GitHub Pages.
Pages must use "GitHub Actions" as its source in the repository settings. Pull requests from
forks build without the secrets, and so without contact details.

For visual or content changes, also check the result in a browser, at desktop width and at a
phone width of about 390 pixels: no horizontal scrolling, a working menu, and a visible focus
when navigating with Tab. With [playwright-cli](https://github.com/microsoft/playwright-cli)
and a build with the values of `.env.example`, most of this is automated:

```sh
mise run build
mise run preview --host 127.0.0.1    # keep running
mise run test-browser                # in a second terminal
```

Pass `--config=/path/to/config.json` to `test-browser` if your environment requires a custom
Chromium executable. Record what was checked; if no browser is available, report that
limitation.

For documentation-only changes, verify relative links and claims against source, then run
`git diff --check` and `mise run test`. Report checks actually run, failures, and skipped
coverage in the pull request. Avoid unrelated formatting and changes to generated files.

## Architecture decisions

Use the [ADR workflow and index](docs/architecture/decisions/README.md) for lasting choices
such as the framework, hosting and deployment, or the handling of contact details. Copy the
[template](docs/architecture/decisions/_adr-template.md), explain the alternatives and
consequences, and identify how reviewers can detect drift. Routine implementation details do
not need an ADR.
