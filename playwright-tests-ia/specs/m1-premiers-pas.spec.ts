import { test, expect } from '@playwright/test';

/**
 * MODULE 1 : premiers tests.
 * Illustre les slides « Anatomie d'un fichier de test », « Du fichier vide au
 * test complet » et « Naviguer, cliquer, saisir ».
 */

test('la page d\'accueil affiche le catalogue', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Boutique interne/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nos produits');
  await expect(page.getByRole('listitem')).toHaveCount(8);
});

test('la recherche filtre le catalogue', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Rechercher un produit').fill('écran');
  await page.getByRole('button', { name: 'Rechercher' }).click();

  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('heading', { name: 'Écran 27 pouces' })).toBeVisible();
});

test('une recherche sans résultat affiche un message', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Rechercher un produit').fill('imprimante');
  await page.getByRole('button', { name: 'Rechercher' }).click();

  await expect(page.getByText('Aucun produit ne correspond')).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

/** Le parcours des cinq étapes : arriver, agir, vérifier. */
test('ajoute un article au panier', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('listitem')
    .filter({ hasText: 'Clavier mécanique' })
    .getByRole('button', { name: 'Ajouter au panier' })
    .click();

  // Le badge est mis a jour apres 350 ms : l'assertion web-first attend seule.
  await expect(page.getByTestId('badge-panier')).toHaveText('1');

  await page.getByRole('link', { name: /Panier/ }).click();
  await expect(page.getByTestId('total-panier')).toHaveText('49,00 €');
});

test('un produit en rupture n\'est pas commandable', async ({ page }) => {
  await page.goto('/');

  const carte = page.getByRole('listitem').filter({ hasText: 'Casque antibruit' });
  await expect(carte.getByRole('button', { name: 'Indisponible' })).toBeDisabled();
});

test('la fiche produit affiche le prix et le stock', async ({ page }) => {
  await page.goto('/produit?id=3');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Écran 27 pouces');
  await expect(page.getByTestId('prix')).toHaveText('289,00 €');
  await expect(page.getByTestId('stock')).toHaveText('4 en stock');
});
