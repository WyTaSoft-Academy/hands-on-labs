import { Page, Locator } from '@playwright/test';

export class PanierPage {
  readonly total: Locator;

  constructor(private readonly page: Page) {
    this.total = page.getByTestId('total-panier');
  }

  async aller() {
    await this.page.goto('/panier');
  }

  ligne(nomProduit: string): Locator {
    return this.page.getByRole('row', { name: new RegExp(nomProduit) });
  }

  async retirer(nomProduit: string) {
    await this.ligne(nomProduit).getByRole('button', { name: 'Retirer' }).click();
  }

  async commander() {
    await this.page.getByRole('button', { name: 'Commander' }).click();
  }
}
