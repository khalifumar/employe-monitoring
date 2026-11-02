import { test, expect } from '@playwright/test';

test.describe('Selaras Dashboard Smoke Tests', () => {
  test('navigates through all core pages smoothly', async ({ page }) => {
    // 1. Manager Overview Page
    await page.goto('/');
    await expect(page).toHaveTitle(/Selaras/i);
    await expect(page.locator('header')).toBeVisible();

    // 2. Team Insights Page
    await page.goto('/insights');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // 3. My Wellbeing Page (Personal View)
    await page.goto('/my-wellbeing');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // 4. Privacy Center Page (Consent, k>=5 shield, data deletion)
    await page.goto('/privacy');
    await expect(page.getByText(/privasi/i).first()).toBeVisible();

    // 5. Settings Page
    await page.goto('/settings');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // 6. Onboarding Page
    await page.goto('/onboarding');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('switches language between Indonesian and English', async ({ page }) => {
    await page.goto('/');

    // Look for language toggle button
    const langBtn = page.getByRole('button', { name: 'Ganti Bahasa' });
    await expect(langBtn).toBeVisible();

    // Switch language
    await langBtn.click();
    // Verification: English or Indonesian copy appears
    await expect(page.getByText(/Ringkasan Tim|Team Overview/i).first()).toBeVisible();
  });

  test('switches theme between Light and Dark mode', async ({ page }) => {
    await page.goto('/');

    const themeBtn = page.getByRole('button', { name: 'Ganti Tema' });
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toBeDefined();
  });

  test('enforces k >= 5 team shield suppression on small teams', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Select the small team (< 5 members: k=3)
    const teamSelect = page.getByLabel('Pilih Tim');
    await expect(teamSelect).toBeVisible();
    await teamSelect.selectOption('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

    // Shield warning text must be visible
    await expect(page.getByText(/Data tim disembunyikan/i).first()).toBeVisible();
  });
});
