import { test, expect } from './fixtures/base';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Sigen Gallery (alpha)');
});

test('default view mode', async ({ homePage }) => {
  await expect(homePage.locateFeedPage()).toBeVisible();
  await expect(homePage.locateGridPage()).toBeHidden();
});

test('view mode switch', async ({ homePage }) => {
  await homePage.switchToGrid();
  await expect(homePage.locateGridPage()).toBeVisible();
  await expect(homePage.locateFeedPage()).toBeHidden();

  await homePage.switchToFeed();
  await expect(homePage.locateFeedPage()).toBeVisible();
  await expect(homePage.locateGridPage()).toBeHidden();
});
