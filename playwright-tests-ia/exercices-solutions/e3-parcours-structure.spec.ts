import { test, expect, Page, Locator } from '@playwright/test';

/* NIVEAU 3 · corrigé. */

/** Petit utilitaire : ajouter un produit depuis le catalogue. */
async function ajouter(page: Page, produit: string) {
  await page.getByRole('listitem')
    .filter({ hasText: produit })
    .getByRole('button', { name: 'Ajouter au panier' })
    .click();
  await expect(page.getByTestId('confirmation')).toBeVisible();
}

test('e11 · ajouter puis retirer met le total à jour', async ({ page }) => {
  await page.goto('/');
  await ajouter(page, 'Écran 27 pouces');
  await ajouter(page, 'Tapis de souris XL');

  await page.getByRole('link', { name: /Panier/ }).click();
  await expect(page.getByTestId('total-panier')).toHaveText('308,00 €');

  await page.getByRole('row', { name: /Tapis de souris XL/ })
    .getByRole('button', { name: 'Retirer' })
    .click();

  await expect(page.getByTestId('total-panier')).toHaveText('289,00 €');
  await expect(page.getByRole('row')).toHaveCount(2);   // en-tête + 1 produit
});

test('e12a · la connexion affiche le nom de l\'utilisateur', async ({ page }) => {
  await page.goto('/connexion');

  await page.getByLabel('Adresse email').fill('client@demo.test');
  await page.getByLabel('Mot de passe').fill('demo');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await expect(page.getByTestId('utilisateur')).toHaveText('Marie DUPONT');
  await expect(page.getByRole('link', { name: 'Se déconnecter' })).toBeVisible();
});

test('e12b · la connexion refuse un mot de passe incorrect', async ({ page }) => {
  await page.goto('/connexion');

  await page.getByLabel('Adresse email').fill('client@demo.test');
  await page.getByLabel('Mot de passe').fill('mauvais');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await expect(page.getByRole('alert')).toHaveText('Identifiants incorrects');
  await expect(page.getByTestId('utilisateur')).toHaveCount(0);
});

/**
 * Exercice 13. Le Page Object expose des interactions et des locators.
 * Il ne contient aucune assertion métier : c'est le test qui décide.
 */
class ConnexionPage {
  readonly erreur: Locator;

  constructor(private readonly page: Page) {
    this.erreur = page.getByRole('alert');
  }

  async aller() {
    await this.page.goto('/connexion');
  }

  async seConnecter(email: string, motDePasse: string) {
    await this.page.getByLabel('Adresse email').fill(email);
    await this.page.getByLabel('Mot de passe').fill(motDePasse);
    await this.page.getByRole('button', { name: 'Se connecter' }).click();
  }
}

test('e13a · connexion réussie, via le Page Object', async ({ page }) => {
  const connexion = new ConnexionPage(page);

  await connexion.aller();
  await connexion.seConnecter('client@demo.test', 'demo');

  await expect(page.getByTestId('utilisateur')).toHaveText('Marie DUPONT');
});

test('e13b · connexion refusée, via le Page Object', async ({ page }) => {
  const connexion = new ConnexionPage(page);

  await connexion.aller();
  await connexion.seConnecter('client@demo.test', 'mauvais');

  await expect(connexion.erreur).toHaveText('Identifiants incorrects');
});

/**
 * Exercice 14. Un test par jeu de données, généré depuis un tableau.
 * Chaque cas apparaît séparément dans le rapport, peut échouer sans bloquer
 * les autres, et peut être relancé seul.
 */
const PRODUITS = [
  { id: 1, nom: 'Clavier mécanique', prix: '49,00 €' },
  { id: 2, nom: 'Souris ergonomique', prix: '29,00 €' },
  { id: 7, nom: 'Support d\'écran', prix: '39,00 €' },
  { id: 8, nom: 'Tapis de souris XL', prix: '19,00 €' },
];

for (const produit of PRODUITS) {
  test(`e14 · la fiche de « ${produit.nom} » affiche ${produit.prix}`, async ({ page }) => {
    await page.goto(`/produit?id=${produit.id}`);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(produit.nom);
    await expect(page.getByTestId('prix')).toHaveText(produit.prix);
  });
}

test('e15 · commande complète, étape par étape', async ({ page }) => {
  await test.step('se connecter', async () => {
    await page.goto('/connexion');
    await page.getByLabel('Adresse email').fill('client@demo.test');
    await page.getByLabel('Mot de passe').fill('demo');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByTestId('utilisateur')).toHaveText('Marie DUPONT');
  });

  await test.step('composer le panier', async () => {
    await page.goto('/');
    await ajouter(page, 'Webcam HD');
    await ajouter(page, 'Support d\'écran');
  });

  await test.step('vérifier le panier', async () => {
    await page.goto('/panier');
    await expect(page.getByTestId('total-panier')).toHaveText('118,00 €');
  });

  await test.step('commander', async () => {
    await page.getByRole('button', { name: 'Commander' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vos commandes');
    await expect(page.getByTestId('commande-nouvelle')).toContainText('118,00 €');
  });
});
