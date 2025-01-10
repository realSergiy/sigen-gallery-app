/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import { HomePage } from './home-page';

export const test = base.extend<{ homePage: HomePage }>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await use(homePage);
  },
});

export { expect } from '@playwright/test';
