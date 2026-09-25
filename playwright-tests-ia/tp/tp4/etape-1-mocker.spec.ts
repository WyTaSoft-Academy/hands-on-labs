import { test, expect } from '@playwright/test';

/**
 * TP 4 · ETAPE 1 — simuler l'API : nominal, liste vide, erreur 500.
 *
 * Le catalogue est rendu PAR LE NAVIGATEUR depuis /api/produits. C'est ce qui
 * rend l'interception observable : le mock change ce qui s'affiche a l'ecran,
 * pas seulement ce que voit l'assertion.
 *
 * Le mock sert a atteindre des etats qu'on ne sait pas produire autrement :
 * un catalogue vide, une panne du service, une reponse lente. Il ne sert pas a
 * remplacer l'application par commodite — un test qui mocke tout ne teste plus
 * que ses propres mocks.
 */

test('cas nominal : le catalogue remplace s\'affiche tel quel', async ({ page }) => {
  await page.route('**/api/produits*', (route) =>
    route.fulfill({
      json: [
        { id: 1, nom: 'Produit factice', categorie: 'Test', prix: 12.5, stock: 3 },
      ],
    }));

  await page.goto('/');

  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Produit factice' })).toBeVisible();
  await expect(page.getByTestId('prix-1')).toHaveText('12,50 €');
});

test('liste vide : l\'application affiche le message prevu', async ({ page }) => {
  await page.route('**/api/produits*', (route) => route.fulfill({ json: [] }));

  await page.goto('/');

  await expect(page.getByText('Aucun produit ne correspond')).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

test('erreur 500 : l\'application degrade proprement', async ({ page }) => {
  await page.route('**/api/produits*', (route) =>
    route.fulfill({ status: 500, json: { erreur: 'Service indisponible' } }));

  await page.goto('/');

  // Le cas d'erreur est celui qu'on oublie de tester, et celui que
  // l'utilisateur rencontre le jour ou le service tombe.
  await expect(page.getByRole('alert'))
    .toHaveText('Le catalogue est momentanément indisponible.');
});
