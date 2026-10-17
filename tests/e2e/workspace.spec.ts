import { test, expect } from '@playwright/test';

const routes = ['dashboard', 'accounts', 'net-worth', 'income', 'expenses', 'transactions', 'settings'];

test('every workspace page fits phone, tablet, and desktop without browser errors', async ({ page }) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 768, 820, 1440]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const route of routes) {
      await page.goto(`/${route}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('.workspace-art canvas')).toHaveAttribute('data-rendered', 'true');
      const overflow = await page.evaluate(() => ({ width: window.innerWidth, scroll: document.documentElement.scrollWidth, elements: [...document.querySelectorAll("main *")].filter(el => el.getBoundingClientRect().right > window.innerWidth + 1).map(el => ({tag: el.tagName, cls: el.getAttribute("class"), right: el.getBoundingClientRect().right})) }));
      expect.soft(overflow.scroll <= overflow.width, JSON.stringify({route, width, overflow})).toBeTruthy();
      if (width === 1440) {
        await page.screenshot({ path: `artifacts/workspace-${route}-desktop.png`, fullPage: true });
        if (route === "dashboard") await page.screenshot({ path: "artifacts/workspace-overview.png" });
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of routes) {
    await page.goto(`/${route}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.workspace-art canvas')).toHaveAttribute('data-rendered', 'true');
    await page.screenshot({ path: `artifacts/workspace-${route}-mobile.png`, fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('mobile dock changes pages and its menu restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dashboard');
  const dock = page.getByRole('navigation', { name: 'Quick navigation' });
  await expect(dock.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
  await dock.getByRole('link', { name: 'Accounts' }).click();
  await expect(page).toHaveURL(/\/accounts$/);
  await expect(dock.getByRole('link', { name: 'Accounts' })).toHaveAttribute('aria-current', 'page');
  await dock.getByRole('link', { name: 'Activity' }).click();
  await expect(page).toHaveURL(/\/transactions$/);
  const more = dock.getByRole('button', { name: 'More workspace pages' });
  await more.click();
  const drawer = page.getByRole('dialog', { name: 'Main navigation' });
  await expect(drawer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
  await expect(more).toBeFocused();
  await more.click();
  await drawer.getByRole('link', { name: 'Income', exact: true }).click();
  await expect(page).toHaveURL(/\/income$/);
  await expect(drawer).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'The sources of your progress.' })).toBeVisible();
  const bounds = await dock.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
  expect(await dock.evaluate(node => [...node.querySelectorAll('a,button')].every(item => item.getBoundingClientRect().height >= 44))).toBeTruthy();
});

test('workspace artwork can pause and reduced motion keeps the pages fully usable', async ({ page }) => {
  await page.goto('/dashboard');
  const pause = page.getByRole('button', { name: 'Pause workspace artwork', exact: true });
  await pause.click();
  await expect(page.getByRole('button', { name: 'Play workspace artwork', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Play workspace artwork', exact: true }).click();
  await expect(pause).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Artwork motion reduced by your system preference' })).toBeDisabled();
  await expect(page.locator('.page-heading')).toHaveCSS('animation-name', 'none');
  await page.goto('/net-worth');
  await page.getByRole('button', { name: '1Y', exact: true }).click();
  await expect(page.getByRole('img', { name: /Net worth history from/ })).toHaveAttribute('aria-label', /2025-10-10/);
  await page.getByText('Inspect historical balances', { exact: true }).click();
  await expect(page.locator('.snapshot-table')).toBeVisible();
});
