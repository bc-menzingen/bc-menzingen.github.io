import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import { deobfuscate } from "altcha-lib/obfuscation";

const origin = "https://bcmenzingen.ch";
const posts = [
  "jubilaeumsausflug",
  "gv-2019",
  "29-mai-2018-halle-geschlossen-ersatzprogramm",
  "28-mai-halle-geschlossen",
  "38-gv-badminton-menzingen",
  "jassturnier-2018",
  "halle-geschlossen",
];
const routes = ["", "ueber-uns", "vorstand", "kontakt", "news", ...posts];
const { CONTACT_EMAIL, CONTACT_PHONE } = process.env;
const page = (route) =>
  readFile(path.join("dist", route, "index.html"), "utf8");

async function assertLocalLinks(html) {
  for (const [, url] of html.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
    await access(
      path.join("dist", url.endsWith("/") ? `${url}index.html` : url),
    );
  }
}

for (const route of routes) {
  test(`/${route} is a complete page without remains of WordPress`, async () => {
    const html = await page(route);
    assert.match(html, /lang="de-CH"/);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
    assert.ok(
      html.includes(
        `rel="canonical" href="${origin}/${route ? `${route}/` : ""}"`,
      ),
    );
    assert.match(html, /Dienstags: 20.15 – 22.00 Uhr/);
    assert.doesNotMatch(html, /wp-content|wpcf7|www\.bcmenzingen\.ch|<form/);
    await assertLocalLinks(html);
  });
}

test("news lists every post, newest first", async () => {
  const html = await page("news");
  const positions = posts.map((post) => html.indexOf(`href="/${post}/"`));
  assert.ok(positions.every((position) => position > 0));
  assert.deepEqual(
    positions,
    positions.toSorted((a, b) => a - b),
  );
});

test("old archive URLs redirect to the news", async () => {
  for (const route of [
    "category/allgemein",
    "author/kevin",
    "anlaesse",
    "events",
  ]) {
    assert.match(
      await page(route),
      /http-equiv="refresh" content="[^"]*url=\/news\/"/i,
    );
  }
});

test("404 page, favicon, robots.txt and sitemap are published", async () => {
  const html = await readFile("dist/404.html", "utf8");
  assert.match(html, /Seite nicht gefunden/);
  assert.match(html, /content="noindex, follow"/);
  await assertLocalLinks(html);
  assert.match(
    await readFile("dist/robots.txt", "utf8"),
    new RegExp(`Sitemap: ${origin}/sitemap-index.xml`),
  );
  const sitemap = await readFile("dist/sitemap-0.xml", "utf8");
  for (const route of routes)
    assert.ok(
      sitemap.includes(`<loc>${origin}/${route ? `${route}/` : ""}</loc>`),
      route,
    );
  assert.doesNotMatch(sitemap, /\/404/);
});

const email =
  /[\w.+-]+@(?!example\.com\b)[\w-]+(?:\.[\w-]+)*\.(?:ch|com|net|org|de|li|info)\b/i;
const phone =
  /(?:\+|00)41[\s./()-]*\d|\b0\d{2}[\s./-]\d{3}[\s./-]\d{2}[\s./-]\d{2}\b/;

test("no published file contains an email address, a phone number, or the archived PDF", async () => {
  const files = await readdir("dist", { recursive: true });
  assert.deepEqual(
    files.filter((file) => /\.(pdf|docx?)$/i.test(file)),
    [],
  );
  for (const file of files.filter((name) =>
    /\.(html|js|css|xml|txt)$/.test(name),
  )) {
    const text = await readFile(path.join("dist", file), "utf8");
    assert.doesNotMatch(text, /href="(?:mailto|tel):/, file);
    if (!file.endsWith(".js")) {
      // Not assert.doesNotMatch: its message would print the address into public CI logs.
      assert.ok(!email.test(text), `Email address in ${file}`);
      assert.ok(!phone.test(text), `Phone number in ${file}`);
    }
    for (const value of [CONTACT_EMAIL, CONTACT_PHONE])
      assert.ok(!value || !text.includes(value), `Contact detail in ${file}`);
  }
});

test("no file in the repository contains an email address, a phone number, or a document", async () => {
  const files = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { encoding: "utf8" },
  )
    .split("\0")
    .filter((file) => file && file !== "package-lock.json");
  assert.ok(files.includes("package.json"));
  for (const file of files) {
    assert.doesNotMatch(file, /\.(pdf|docx?)$/i);
    if (/\.(png|jpe?g|webp|avif|ico|svg)$/i.test(file)) continue;
    const text = await readFile(file, "utf8").catch(() => "");
    assert.ok(!email.test(text), `Email address in ${file}`);
    assert.ok(!phone.test(text), `Phone number in ${file}`);
    for (const value of [CONTACT_EMAIL, CONTACT_PHONE]) {
      assert.ok(
        !value ||
          file === ".env.example" ||
          !text.includes(value) ||
          file.startsWith("tests/"),
        `Contact detail in ${file}`,
      );
    }
  }
});

test("the Kontakt page carries exactly the configured details, encrypted", async () => {
  const html = await page("kontakt");
  assert.equal(html.includes('href="#email"'), Boolean(CONTACT_EMAIL));
  assert.equal(html.includes('href="#telefon"'), Boolean(CONTACT_PHONE));
  const sealed = html.match(/data-contact="([^"]+)"/)?.[1];
  if (!CONTACT_EMAIL && !CONTACT_PHONE) return assert.equal(sealed, undefined);
  const details = JSON.parse(await deobfuscate(sealed));
  // Compared as booleans, so that a failure does not print the details into public CI logs.
  assert.ok(details.email === (CONTACT_EMAIL || undefined), "email differs");
  assert.ok(details.phone === (CONTACT_PHONE || undefined), "phone differs");
});
