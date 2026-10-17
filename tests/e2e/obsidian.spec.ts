import { test, expect } from '@playwright/test';

test('command menu supports shortcut, keyboard selection, search, and focus restoration', async ({ page }) => {
  await page.goto('/dashboard');
  const trigger = page.getByRole('button', { name: 'Open command menu' });
  await trigger.focus();
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: 'Go anywhere in Aureli' });
  const search = dialog.getByRole('combobox', { name: 'Search destinations' });
  await expect(search).toBeFocused();
  await page.screenshot({ path: 'artifacts/obsidian-command-menu.png', animations: 'disabled' });
  await search.press('ArrowDown');
  await expect(dialog.getByRole('option', { name: /Accounts/ })).toHaveAttribute('aria-selected', 'true');
  await search.press('Enter');
  await expect(page).toHaveURL(/\/accounts$/);
  await expect(dialog).not.toBeVisible();
  await trigger.click();
  await search.fill('no-such-destination');
  await expect(dialog.getByText('No destinations found')).toBeVisible();
  await search.fill('spending');
  await search.press('Enter');
  await expect(page).toHaveURL(/\/expenses$/);
  await trigger.click();
  await search.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('dashboard transactions slide in, trap focus, preserve page, and return focus', async ({ page }) => {
  await page.goto('/dashboard');
  const record = page.locator('.recent-row').first();
  const description = await record.locator('.recent-description strong').innerText();
  await record.click();
  const sheet = page.getByRole('dialog', { name: description, exact: true });
  await expect(sheet).toBeVisible();
  await expect(sheet).toContainText('HOW THIS COUNTS');
  await expect.poll(async () => {
    const box = await sheet.boundingBox();
    return box ? Math.round(box.x + box.width) : 0;
  }).toBe(page.viewportSize()!.width);
  await expect(sheet).toHaveCSS('max-height', `${page.viewportSize()!.height}px`);
  await page.screenshot({ path: 'artifacts/obsidian-detail-desktop.png', animations: 'disabled' });
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).toHaveCount(1);
  for (let i = 0; i < 5; i++) await page.keyboard.press('Tab');
  expect(await sheet.evaluate(node => node.contains(document.activeElement))).toBeTruthy();
  await page.keyboard.press('Escape');
  await expect(sheet).not.toBeVisible();
  await expect(record).toBeFocused();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('account sheet opens supporting activity and mobile navigation restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/accounts');
  const account = page.locator('.account-card').first();
  await account.click();
  const sheet = page.getByRole('dialog');
  await expect(sheet).toContainText('Balance observed');
  await expect.poll(async () => {
    const box = await sheet.boundingBox();
    return box ? Math.round(box.y + box.height) : 0;
  }).toBe(844);
  await page.screenshot({ path: 'artifacts/obsidian-detail-mobile.png', animations: 'disabled' });
  await sheet.getByRole('link', { name: 'See supporting activity below' }).click();
  await expect(sheet).not.toBeVisible();
  await expect(page.locator('.account-activity[open]')).toHaveCount(1);
  await expect(page.locator('.account-activity[open] summary')).toBeFocused();
  const menu = page.getByRole('button', { name: 'Open navigation', exact: true });
  await menu.click();
  await expect(page.getByRole('dialog', { name: 'Main navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
});

test('Obsidian surfaces fit narrow phones, tablets, and desktop, including menus and sheets', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Your money, in perspective.' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await page.getByRole('button', { name: 'Open command menu' }).click();
    const menu = page.getByRole('dialog');
    const bounds = await menu.boundingBox();
    expect(bounds!.width).toBeLessThanOrEqual(width);
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/transactions');
  await expect(page.locator('tbody tr').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  expect(await page.locator('.table-scroll').evaluate(node => node.scrollWidth <= node.clientWidth)).toBeTruthy();
  await page.screenshot({ path: 'artifacts/obsidian-transactions-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('reduced motion preserves chart updates and removes panel transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dashboard');
  await page.getByRole('button', { name: '1Y', exact: true }).click();
  await expect(page).toHaveURL(/range=1Y/);
  await expect(page.getByRole('img', { name: /Net worth history from/ })).toHaveAttribute('aria-label', /2025-10-10/);
  await page.locator('.recent-row').first().click();
  const sheet = page.getByRole('dialog');
  await expect(sheet).toHaveCSS('animation-name', 'none');
  await expect(sheet).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sheet).not.toBeVisible();
});
