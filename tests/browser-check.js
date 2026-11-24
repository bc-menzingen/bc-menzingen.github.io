// Expects a build with the dummy values from .env.example, see CONTRIBUTING.md.
async (page) => {
  const base = 'http://127.0.0.1:4321';
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const foreign = [];
  const errors = [];
  page.on('request', (request) => { if (!request.url().startsWith(base) && !request.url().startsWith('data:')) foreign.push(request.url()); });
  page.on('pageerror', (error) => errors.push(error.message));
  const routes = ['', 'ueber-uns/', 'vorstand/', 'kontakt/', 'news/', 'gv-2019/', '29-mai-2018-halle-geschlossen-ersatzprogramm/', '404.html'];

  for (const width of [320, 390, 768, 800, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const at = `/${route} at ${width}px`;
      await page.goto(`${base}/${route}`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow on ${at}`);
      for (const image of await page.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await page.waitForFunction((element) => element.complete && element.naturalWidth > 0, await image.elementHandle());
      }
      const toggle = page.getByRole('button', { name: 'Menü' });
      const kontakt = page.locator('#menu').getByRole('link', { name: 'Kontakt' });
      if (width < 800) {
        assert(!(await kontakt.isVisible()), `Menu must start closed on ${at}`);
        await toggle.click();
        assert(await kontakt.isVisible(), `Menu must open on ${at}`);
        await toggle.click();
        assert(!(await kontakt.isVisible()), `Menu must close on ${at}`);
      } else {
        assert(!(await toggle.isVisible()) && await kontakt.isVisible(), `Menu must be visible on ${at}`);
      }
    }
  }

  // The submenu opens by mouse and by keyboard.
  await page.goto(base);
  const submenu = page.locator('#menu ul');
  const opacity = () => submenu.evaluate((element) => getComputedStyle(element).opacity);
  if (await page.evaluate(() => matchMedia('(hover: hover)').matches)) {
    assert(await opacity() === '0', 'Submenu must start closed');
    await page.locator('#menu').getByRole('link', { name: 'Über uns' }).focus();
    assert(await opacity() === '1', 'Submenu must open by keyboard');
  }

  // Captcha
  const dialog = page.locator('#contact-captcha');
  const confirm = dialog.getByRole('button', { name: 'Ich bin kein Roboter' });
  const emailLink = page.locator('.contact-links a').first();
  const revealed = page.locator('a[href="mailto:test@example.com"]');
  const details = page.locator('a[href^="mailto:"], a[href^="tel:"]');
  let slowest = 0;
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/kontakt/`);
    assert(await details.count() === 0, 'Details must be hidden at first');
    await emailLink.click();
    assert(await confirm.evaluate((button) => button === document.activeElement), 'Dialog must focus the confirmation');
    const box = await dialog.boundingBox();
    assert(box.x >= 0 && box.x + box.width <= width, `Dialog overflows at ${width}px`);
    const start = Date.now();
    await confirm.click();
    await dialog.waitFor({ state: 'hidden' });
    slowest = Math.max(slowest, Date.now() - start);
    assert(await revealed.count() === 1, 'Email missing');
    assert(await page.locator('a[href="tel:+00000000000"]').count() === 1, 'Phone missing');
    assert(await emailLink.evaluate((link) => link === document.activeElement), 'Focus must return to the link');
  }
  for (const close of ['Escape', 'button']) {
    await page.goto(`${base}/kontakt/`);
    await emailLink.click();
    await confirm.click();
    if (close === 'Escape') await page.keyboard.press('Escape');
    else await dialog.getByRole('button', { name: 'Schliessen' }).click();
    await page.waitForTimeout(slowest + 1000);
    assert(await details.count() === 0, `Cancelled captcha must reveal nothing (${close})`);
  }
  await page.goto(`${base}/kontakt/`);
  const sealed = await dialog.getAttribute('data-contact');
  await dialog.evaluate((element) => { element.dataset.contact = 'broken'; });
  await emailLink.click();
  await confirm.click();
  await dialog.getByText('Die Prüfung hat leider nicht funktioniert').waitFor();
  assert(await details.count() === 0, 'Failed captcha must reveal nothing');
  await dialog.evaluate((element, value) => { element.dataset.contact = value; }, sealed);
  await confirm.click();
  await dialog.waitFor({ state: 'hidden' });
  assert(await revealed.count() === 1, 'Retry must work');

  assert(!foreign.length, `Third-party requests: ${foreign.join(', ')}`);
  assert(!errors.length, `Browser errors: ${errors.join(', ')}`);
  return { pages: 'passed', captcha: 'passed', thirdPartyRequests: 0, slowestMs: slowest };
}
