import { test, expect } from '@playwright/test';

/**
 * MODULE 4 : simuler les réponses de l'API.
 * Illustre « page.route » et « Tester ce qui est difficile à provoquer ».
 *
 * Le catalogue est chargé par le navigateur depuis /api/produits : intercepter
 * cet appel change donc réellement ce qui s'affiche à l'écran.
 *
 * À MONTRER EN DIRECT : lancez ces tests avec --headed. On voit la page
 * afficher un catalogue vide, ou le message d'indisponibilité, alors que
 * le serveur, lui, fonctionne parfaitement.
 */

test('catalogue vide : le message adapté s\'affiche', async ({ page }) => {
  await page.route('**/api/produits*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    }),
  );

  await page.goto('/');

  await expect(page.getByText('Aucun produit ne correspond')).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

test('erreur serveur : la page reste utilisable', async ({ page }) => {
  await page.route('**/api/produits*', (route) =>
    route.fulfill({ status: 500, body: '{"erreur":"indisponible"}' }),
  );

  await page.goto('/');

  await expect(page.getByRole('alert'))
    .toHaveText('Le catalogue est momentanément indisponible.');
  // L'entête doit continuer de fonctionner malgré la panne du catalogue.
  await expect(page.getByRole('link', { name: /Panier/ })).toBeVisible();
});

test('panne réseau : la requête est abandonnée', async ({ page }) => {
  await page.route('**/api/produits*', (route) => route.abort());

  await page.goto('/');

  await expect(page.getByRole('alert'))
    .toHaveText('Le catalogue est momentanément indisponible.');
});

test('catalogue remplacé : trois produits fictifs', async ({ page }) => {
  await page.route('**/api/produits*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 101, nom: 'Produit fictif A', categorie: 'Test', prix: 10, stock: 5 },
        { id: 102, nom: 'Produit fictif B', categorie: 'Test', prix: 20, stock: 5 },
        { id: 103, nom: 'Produit fictif C', categorie: 'Test', prix: 30, stock: 0 },
      ]),
    }),
  );

  await page.goto('/');

  await expect(page.getByRole('listitem')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Produit fictif A' })).toBeVisible();
  await expect(page.getByTestId('prix-102')).toHaveText('20,00 €');
  // Le troisième est en rupture : son bouton doit être désactivé.
  await expect(page.getByTestId('ajouter-103')).toBeDisabled();
});

test('réponse lente : la page affiche le catalogue une fois la réponse arrivée', async ({ page }) => {
  await page.route('**/api/produits*', async (route) => {
    await new Promise((r) => setTimeout(r, 1500));
    await route.continue();
  });

  await page.goto('/');

  // Rien à attendre à la main : l'assertion web-first absorbe la latence.
  await expect(page.getByRole('listitem')).toHaveCount(8);
});

test('un seul produit interceptable : la recherche est aussi mockée', async ({ page }) => {
  await page.route('**/api/produits*', (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get('q')).toBe('clavier');
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, nom: 'Clavier mécanique', categorie: 'Périphériques', prix: 49, stock: 12 },
      ]),
    });
  });

  await page.goto('/?q=clavier');

  await expect(page.getByRole('listitem')).toHaveCount(1);
});
