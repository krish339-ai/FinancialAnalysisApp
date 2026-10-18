import { test, expect } from '@playwright/test';

test('the original hero defaults to Living weave and both styles explain every perspective', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const data = await (await request.get('/api/overview?range=1M')).json();
  const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value / 100);
  await page.goto('/');
  const art = page.locator('.landing-artwork-canvas');
  await expect(page.getByLabel('Artwork style')).toHaveValue('weave');
  await expect(art).toHaveAttribute('data-style', 'weave');
  await expect(art).toHaveAttribute('data-rendered', 'true');
  const group = page.getByRole('group', { name: 'Choose a financial perspective' });
  const expectedValues = [data.current.netWorth, data.totals.income, data.totals.income - data.totals.expenses];
  for (const [index, name] of ['Net worth', 'Income', 'Surplus'].entries()) {
    await expect(group.getByRole('button', { name: new RegExp(name) }).locator('.perspective-value')).toHaveText(money(expectedValues[index]));
  }
  for (const style of ['weave', 'orbit']) {
    await page.getByLabel('Artwork style').selectOption(style);
    await expect(art).toHaveAttribute('data-style', style);
    for (const [index, name] of ['Net worth', 'Income', 'Surplus'].entries()) {
      const button = group.getByRole('button', { name: new RegExp(name) });
      await button.focus(); await page.keyboard.press('Enter');
      await expect(button).toBeFocused();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(art).toHaveAttribute('data-mode', String(index));
      await expect(art).toHaveAttribute('aria-label', /Conceptual artwork, not to scale/);
      await expect(button.locator('.perspective-value')).toHaveText(money(expectedValues[index]));
      await expect(page.locator('.perspective-reading p')).not.toBeEmpty();
      await expect(page.locator('.perspective-reading > a')).toHaveAttribute('href', ['/net-worth?range=1M', '/income?range=1M', '/dashboard?range=1M'][index]);
    }
  }
  await expect(art).toHaveAttribute('data-animating', 'true');
  const initial = await art.evaluate(node => (node as HTMLCanvasElement).toDataURL());
  await expect.poll(() => art.evaluate(node => (node as HTMLCanvasElement).toDataURL())).not.toBe(initial);
  await expect(art).toHaveAttribute('data-animating', 'false');
  await page.reload();
  await expect(page.getByLabel('Artwork style')).toHaveValue('orbit');
  await expect(art).toHaveAttribute('data-style', 'orbit');
  await page.getByRole('link', { name: 'Find your perspective', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole('button', { name: 'Open command menu' }).click();
  await expect(page.getByRole('dialog', { name: 'Go anywhere in Aureli' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('both artwork styles fit desktop and mobile in both themes and honor reduced motion', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const art = page.locator('.landing-artwork-canvas');
  for (const theme of ['obsidian', 'ivory']) {
    if (theme === 'ivory') await page.getByRole('button', { name: 'Switch to Porcelain & Ink light theme' }).click();
    for (const style of ['weave', 'orbit']) {
      await page.getByLabel('Artwork style').selectOption(style);
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const [index, name] of ['Net worth', 'Income', 'Surplus'].entries()) {
          const button = page.getByRole('group', { name: 'Choose a financial perspective' }).getByRole('button', { name: new RegExp(name) });
          await button.click();
          await expect(art).toHaveAttribute('data-mode', String(index));
          await expect(art).toHaveAttribute('data-animating', 'false');
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), theme + '/' + style + '/' + width).toBeTruthy();
          const bounds = await button.boundingBox();
          expect(bounds!.height).toBeGreaterThanOrEqual(44);
          expect(bounds!.width).toBeGreaterThanOrEqual(44);
        }
      }
      await page.getByRole('group', { name: 'Choose a financial perspective' }).getByRole('button', { name: /Net worth/ }).click();
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: 'artifacts/artwork-' + style + '-' + theme + '-desktop.png' });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({ path: 'artifacts/artwork-' + style + '-' + theme + '-mobile.png' });
    }
  }
  await page.getByRole('link', { name: 'Step inside Aureli' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('large artwork and the metric buttons beneath it fit the initial viewport', async ({ page }) => {
  await page.goto('/');
  const group = page.getByRole('group', { name: 'Choose a financial perspective' });
  const art = page.locator('.landing-artwork-canvas');
  for (const [width, height] of [[1440, 900], [1366, 768], [1280, 720], [1024, 768], [768, 1024], [390, 844], [375, 667], [320, 568]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    const controls = await group.boundingBox();
    const artwork = await art.boundingBox();
    expect(controls!.y, String(width)).toBeGreaterThanOrEqual(0);
    expect(controls!.y + controls!.height, String(width)).toBeLessThan(height - 8);
    expect(artwork!.y + artwork!.height, String(width)).toBeLessThanOrEqual(controls!.y);
    if (width >= 1024) expect(artwork!.height, String(width)).toBeGreaterThanOrEqual(400);
    if (width === 390) expect(artwork!.height).toBeGreaterThanOrEqual(330);
    for (const amount of await group.locator('.perspective-value').all()) {
      const bounds = await amount.boundingBox();
      expect(bounds!.y + bounds!.height, String(width)).toBeLessThan(height - 8);
      expect(await amount.evaluate(node => node.scrollWidth <= node.clientWidth), String(width)).toBeTruthy();
    }
    for (const [mode, name] of [[1, 'Income'], [2, 'Surplus']] as const) {
      await group.getByRole('button', { name: new RegExp(name) }).click();
      await expect(art).toHaveAttribute('data-mode', String(mode));
      expect(await page.evaluate(() => scrollY), String(width)).toBe(0);
    }
    if ([1280, 390, 320].includes(width)) await page.screenshot({ path: 'artifacts/landing-controls-' + width + '.png' });
  }
});

test('existing dashboard period bookmarks still open their reporting window', async ({ page }) => {
  await page.goto('/?range=1Y');
  await expect(page).toHaveURL(/\/dashboard\?range=1Y$/);
  await expect(page.getByRole('button', { name: '1Y', exact: true })).toHaveAttribute('aria-pressed', 'true');
});
