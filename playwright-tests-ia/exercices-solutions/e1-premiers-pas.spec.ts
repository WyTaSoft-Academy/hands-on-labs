import { test, expect } from '@playwright/test';

/* NIVEAU 1 · corrigé. Chaque test indique le point à retenir. */

test('e1 · la page d\'accueil affiche le bon titre', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Boutique interne/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nos produits');
});

test('e2 · le catalogue affiche 8 produits et leurs prix', async ({ page }) => {
  await page.goto('/');

  // toHaveCount réessaie : le catalogue est chargé par le navigateur,
  // il n'est donc pas présent à l'instant exact où goto() rend la main.
  await expect(page.getByRole('listitem')).toHaveCount(8);
  await expect(page.getByTestId('prix-1')).toHaveText('49,00 €');
});

test('e3a · la recherche filtre le catalogue', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Rechercher un produit').fill('écran');
  await page.getByRole('button', { name: 'Rechercher' }).click();

  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('heading', { name: 'Écran 27 pouces' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Support d\'écran' })).toBeVisible();
});

test('e3b · une recherche sans résultat affiche un message', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Rechercher un produit').fill('imprimante');
  await page.getByRole('button', { name: 'Rechercher' }).click();

  await expect(page.getByText('Aucun produit ne correspond')).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

test('e4 · la fiche produit affiche prix et stock', async ({ page }) => {
  await page.goto('/');

  // On navigue par un clic, comme le ferait un utilisateur.
  await page.getByRole('link', { name: 'Écran 27 pouces' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Écran 27 pouces');
  await expect(page.getByTestId('prix')).toHaveText('289,00 €');
  await expect(page.getByTestId('stock')).toHaveText('4 en stock');
});

test('e5 · ajouter un article met le badge à jour', async ({ page }) => {
  await page.goto('/');

  // On restreint d'abord au bon produit, sinon 7 boutons correspondent.
  await page.getByRole('listitem')
    .filter({ hasText: 'Clavier mécanique' })
    .getByRole('button', { name: 'Ajouter au panier' })
    .click();

  // Aucune attente écrite : l'assertion absorbe seule les 350 ms de délai.
  await expect(page.getByTestId('badge-panier')).toHaveText('1');
  await expect(page.getByTestId('confirmation')).toHaveText('Article ajouté au panier');
});
