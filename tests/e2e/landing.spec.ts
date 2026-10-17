import { test, expect } from '@playwright/test';

test('landing artwork, perspectives, pause control, and dashboard entry work', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your money.A whole newperspective.');
  await expect(page.locator('.aureli-sculpture')).toHaveAttribute('data-rendered', 'true');
  await page.getByRole('button', { name: 'Pause artwork animation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Play artwork animation', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Money in motion/ }).click();
  await expect(page.getByRole('button', { name: /Money in motion/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.perspective-reading')).toContainText('INCOME · LAST 30 DAYS');
  await expect(page.locator('.perspective-reading')).toContainText('$9,936');
  await page.getByRole('button', { name: /Room to grow/ }).click();
  await expect(page.locator('.perspective-reading')).toContainText('PERIOD SURPLUS');
  await expect(page.locator('.perspective-reading')).toContainText('$5,608');
  await page.getByRole('button', { name: /The whole picture/ }).click();
  await page.screenshot({ path: 'artifacts/landing-desktop.png', fullPage: true });
  await page.screenshot({ path: 'artifacts/landing-hero.png' });
  await page.getByRole('link', { name: 'Find your perspective', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Your money, in perspective.' })).toBeVisible();
  await page.getByRole('button', { name: 'Open command menu' }).click();
  await expect(page.getByRole('dialog', { name: 'Go anywhere in Aureli' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('landing fits desktop and mobile and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Animation disabled by reduced-motion preference' })).toBeDisabled();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('link', { name: 'Enter workspace' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Viewport ${width}`).toBeTruthy();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const originalArt = await page.locator('canvas').evaluate(node => (node as HTMLCanvasElement).toDataURL());
  await page.getByRole('button', { name: /Money in motion/ }).click();
  await expect(page.locator('.perspective-reading')).toContainText('$9,936');
  await expect.poll(() => page.locator('canvas').evaluate(node => (node as HTMLCanvasElement).toDataURL())).not.toBe(originalArt);
  await page.getByRole('button', { name: /The whole picture/ }).click();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: 'artifacts/landing-mobile.png', fullPage: true });
  await page.getByRole('link', { name: 'Step inside Aureli' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('existing dashboard period bookmarks still open their reporting window', async ({ page }) => {
  await page.goto('/?range=1Y');
  await expect(page).toHaveURL(/\/dashboard\?range=1Y$/);
  await expect(page.getByRole('button', { name: '1Y', exact: true })).toHaveAttribute('aria-pressed', 'true');
});
