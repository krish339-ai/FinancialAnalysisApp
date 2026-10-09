import { test, expect } from '@playwright/test';
test('dashboard displays calculated cards and switches the history window', async ({ page }) => {
  await page.goto('/'); await expect(page.getByRole('heading', { name: 'Clarity looks good on you.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Net worth', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '1Y', exact: true }).click(); await expect(page).toHaveURL(/range=1Y/);
  await expect(page.getByRole('button', { name: '1Y', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '1M', exact: true }).click(); await expect(page).toHaveURL(/range=1M/);
});
test('all four cards open dedicated detail pages', async ({ page }) => {
  for (const [label, route, heading] of [['Net worth', '/net-worth', 'A foundation worth building.'], ['Income', '/income', 'The sources of your progress.'], ['Expenses', '/expenses', 'A closer look at your spending.'], ['Recent transactions', '/transactions', 'Every move, in one place.']]) {
    await page.goto('/'); await page.getByRole('link', { name: `Open ${label} analysis`, exact: true }).click(); await expect(page).toHaveURL(new RegExp(`${route}$`)); await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
});
test('search, category filters, empty states and transaction details work', async ({ page }) => {
  await page.goto('/transactions'); await page.getByRole('textbox', { name: 'Search transactions' }).fill('payroll');
  await expect(page.getByRole('button', { name: /Forma Studio/ }).first()).toBeVisible();
  await page.getByRole('button', { name: /Forma Studio/ }).first().click(); await expect(page.getByRole('dialog')).toContainText('INCOME'); await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('textbox', { name: 'Search transactions' }).fill('nothing-matches-this'); await expect(page.getByRole('heading', { name: 'No matching transactions' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Search transactions' }).fill(''); await page.getByLabel('Filter by category').selectOption('Groceries'); await expect(page.getByRole('button', { name: /Whole Foods/ }).first()).toBeVisible();
});
test('add account flow creates an isolated session preview and can be reset', async ({ page }) => {
  await page.goto('/'); await page.getByRole('main').getByRole('button', { name: 'Add account', exact: true }).click();
  await page.getByRole('button', { name: 'Savings', exact: true }).click(); await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Account name').fill('Demo travel fund'); await page.getByLabel('Current value · USD').fill('3400.25');
  await page.getByRole('button', { name: 'Create demo account' }).click(); await expect(page.getByRole('heading', { name: 'Demo account created' })).toBeVisible();
  await page.getByRole('button', { name: 'View accounts' }).click(); await expect(page.getByText('Demo travel fund', { exact: true })).toBeVisible();
  await page.reload(); await expect(page.getByText('Demo travel fund', { exact: true })).toBeVisible();
  await page.goto('/settings'); await page.getByRole('button', { name: 'Reset demo session' }).click(); await expect(page.getByRole('status')).toContainText('Session accounts cleared');
});
test('CSV export downloads filtered synthetic activity', async ({ page }) => {
  await page.goto('/transactions'); await page.getByLabel('Filter by category').selectOption('Salary'); const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export CSV' }).click(); expect((await download).suggestedFilename()).toBe('aureli-synthetic-transactions.csv');
});
test('API rejects invalid ranges and serves the synthetic reference date', async ({ request }) => {
  const invalid = await request.get('/api/overview?range=bad'); expect(invalid.status()).toBe(400);
  const result = await request.get('/api/overview?range=1M'); expect(result.ok()).toBeTruthy(); const data = await result.json(); expect(data.mode).toBe('synthetic-demo'); expect(data.period.end).toBe('2026-10-09');
});
test('desktop and mobile dashboard have no page overflow or browser errors', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await expect(page.getByRole('heading', { name: 'Income', exact: true })).toBeVisible(); await page.screenshot({ path: 'artifacts/dashboard-desktop.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.setViewportSize({ width: 390, height: 844 }); await page.screenshot({ path: 'artifacts/dashboard-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click(); await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Accounts', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Your financial home base.' })).toBeVisible(); expect(errors).toEqual([]);
});
