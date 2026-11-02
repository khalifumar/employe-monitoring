import { test, expect } from '@playwright/test';

test.describe('Role-based Login and Routing', () => {
  test('logs in as Employee and lands on /my-wellbeing with filtered navigation', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Masuk ke Portal Selaras' })).toBeVisible();

    // Click quick login as Karyawan
    await page.getByRole('button', { name: 'Masuk sebagai Karyawan' }).click();

    // Should redirect to /my-wellbeing
    await expect(page).toHaveURL(/.*\/my-wellbeing/);
    await expect(page.getByText('khalifumar.al@gmail.com').first()).toBeVisible();

    // Manager nav links should NOT be in the header
    await expect(page.locator('header').getByRole('link', { name: 'Ringkasan Tim' })).toHaveCount(0);
    await expect(page.locator('header').getByRole('link', { name: 'Analisis Faktor (ML)' })).toHaveCount(0);

    // Personal nav links must be present
    await expect(page.locator('header').getByRole('link', { name: 'Kesejahteraan Saya' })).toBeVisible();
    await expect(page.locator('header').getByRole('link', { name: 'Pusat Privasi' })).toBeVisible();
  });

  test('guards manager pages if employee tries to access them directly', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Masuk sebagai Karyawan' }).click();
    await expect(page).toHaveURL(/.*\/my-wellbeing/);

    // Direct navigate to overview
    await page.goto('/');
    await expect(page.getByText('Halaman Khusus Manajer Tim')).toBeVisible();
    await page.getByRole('link', { name: 'Buka Kesejahteraan Saya' }).click();
    await expect(page).toHaveURL(/.*\/my-wellbeing/);
  });

  test('logs in as Manager and lands on / with team switcher and aggregates', async ({ page }) => {
    await page.goto('/login');

    // Click quick login as Manager
    await page.getByRole('button', { name: 'Masuk sebagai Manajer' }).click();

    // Should redirect to overview
    await expect(page).toHaveURL(/.*\//);
    await expect(page.locator('header').getByText('khalifumardev@gmail.com')).toBeVisible();

    // Manager nav links and Team Selector must be present
    await expect(page.locator('header').getByRole('link', { name: 'Ringkasan Tim' })).toBeVisible();
    await expect(page.locator('header').getByRole('link', { name: 'Analisis Faktor (ML)' })).toBeVisible();
    await expect(page.locator('header').getByRole('combobox')).toBeVisible(); // Team selector
  });
});
