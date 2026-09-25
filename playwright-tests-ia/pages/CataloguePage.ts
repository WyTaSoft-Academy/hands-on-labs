import { Page, Locator, expect } from '@playwright/test';

/**
 * MODULE 3 : Page Object.
 * Il decrit COMMENT interagir. Il ne contient pas les assertions metier :
 * c'est le test qui decide de ce qui doit etre vrai.
 */
export class CataloguePage {
  readonly recherche: Locator;
  readonly badgePanier: Locator;

  constructor(private readonly page: Page) {
    this.recherche = page.getByLabel('Rechercher un produit');
    this.badgePanier = page.getByTestId('badge-panier');
  }

  async aller() {
    await this.page.goto('/');
  }

  carte(nomProduit: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: nomProduit });
  }

  async chercher(terme: string) {
    await this.recherche.fill(terme);
    await this.page.getByRole('button', { name: 'Rechercher' }).click();
  }

  async ajouter(nomProduit: string) {
    await this.carte(nomProduit)
      .getByRole('button', { name: 'Ajouter au panier' })
      .click();
    await expect(this.page.getByTestId('confirmation')).toBeVisible();
  }

  async ouvrirPanier() {
    await this.page.getByRole('link', { name: /Panier/ }).click();
  }
}
