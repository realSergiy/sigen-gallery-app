import { type Page } from '@playwright/test';

export class HomePage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  locateFeedPage() {
    return this.page.getByTestId('VideoFeedPage');
  }

  locateGridPage() {
    return this.page.getByTestId('VideoGridPage');
  }

  async switchToGrid() {
    await this.page.getByTestId('GridSwitcherItem').click();
  }

  async switchToFeed() {
    await this.page.getByTestId('FeedSwitcherItem').click();
  }
}
