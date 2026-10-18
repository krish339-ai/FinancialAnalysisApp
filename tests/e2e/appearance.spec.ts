import { test, expect } from '@playwright/test';

const routes = ['dashboard', 'accounts', 'transactions', 'net-worth', 'income', 'expenses', 'settings'];

test('theme and artwork preferences persist independently across pages and reloads', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'obsidian');
  await page.getByLabel('Artwork style').selectOption('orbit');
  await page.getByRole('button', { name: 'Switch to Porcelain & Ink light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ivory');
  await page.getByRole('link', { name: 'Enter workspace', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ivory');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ivory');
  await page.goto('/settings');
  await expect(page.getByRole('button', { name: /Porcelain & Ink Light, blue/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Artwork style')).toHaveValue('orbit');
  await page.getByRole('button', { name: /Obsidian Dark, sage/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'obsidian');
  await page.getByLabel('Artwork style').selectOption('weave');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'obsidian');
  await expect(page.getByLabel('Artwork style')).toHaveValue('weave');
  expect(errors).toEqual([]);
});

test('Porcelain & Ink covers every workspace page, charts, command search and sliding panels on desktop and mobile', async ({ page }) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Switch to Porcelain & Ink light theme' }).click();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1080 });
    for (const route of routes) {
      await page.goto('/' + route);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'ivory');
      await expect(page.getByRole('button', { name: 'Switch to Obsidian dark theme' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route + '/' + width).toBeTruthy();
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(246, 244, 239)');
      await page.screenshot({ path: 'artifacts/ivory-' + route + '-' + width + '.png', fullPage: true });
    }
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Open command menu' }).click();
    const menu = page.getByRole('dialog', { name: 'Go anywhere in Aureli' });
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS('color', 'rgb(36, 54, 77)');
    await page.screenshot({ path: 'artifacts/ivory-command-' + width + '.png' });
    await page.keyboard.press('Escape');
    await page.locator('.recent-row').first().click();
    const sheet = page.locator('.dialog-sheet');
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveCSS('color', 'rgb(36, 54, 77)');
    await page.screenshot({ path: 'artifacts/ivory-detail-' + width + '.png' });
    await page.keyboard.press('Escape');
  }
});

test('preferences remain usable when browser storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Storage disabled', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Storage disabled', 'SecurityError'); };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to Porcelain & Ink light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'ivory');
  await page.getByLabel('Artwork style').selectOption('orbit');
  await expect(page.locator('.landing-artwork-canvas')).toHaveAttribute('data-style', 'orbit');
  await page.getByRole('button', { name: 'Switch to Obsidian dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'obsidian');
});
