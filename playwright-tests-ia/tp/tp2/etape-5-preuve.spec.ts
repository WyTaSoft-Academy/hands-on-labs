import { test, expect, Page } from '@playwright/test';

/**
 * TP 2 · ETAPE 5 — la preuve : casser l'application, voir le rouge.
 *
 * L'enonce demande de casser volontairement l'application et de verifier que
 * chacun des tests devient rouge. Un test qui reste vert quand l'application
 * est cassee ne verifie rien.
 *
 * Ici la regression est SIMULEE par une interception reseau : le catalogue est
 * servi modifie. C'est reproductible, ca ne touche pas au serveur, et ca
 * annonce le mocking du module 4.
 *
 * ATTENTION a ce qu'on croit casser. Le catalogue est rendu par le navigateur
 * depuis /api/produits, mais le TOTAL DU PANIER est calcule par le serveur a
 * partir de ses propres donnees. Fausser /api/produits change donc ce qui
 * s'affiche au catalogue, et PAS le total du panier. Le verifier avant
 * d'ecrire l'assertion evite un « Expected to fail, but passed » qui donne
 * l'impression d'un test solide alors qu'on a casse la mauvaise chose.
 *
 * Les deux tests sont annotes test.fail() : ils DOIVENT echouer.
 */

/** Le catalogue, servi avec un prix fausse sur le clavier. */
async function fausserLePrix(page: Page) {
  await page.route('**/api/produits*', async (route) => {
    const produits = await (await route.fetch()).json();
    for (const p of produits) if (p.nom === 'Clavier mécanique') p.prix = 99;
    await route.fulfill({ json: produits });
  });
}

test.fail('le test du prix devient rouge quand le catalogue change', async ({ page }) => {
  await fausserLePrix(page);
  await page.goto('/');

  await expect(page.getByTestId('prix-1')).toHaveText('49,00 €', { timeout: 2000 });
});

test.fail('le test de recherche devient rouge quand un produit s\'ajoute', async ({ page }) => {
  await page.route('**/api/produits*', async (route) => {
    const produits = await (await route.fetch()).json();
    // Un second clavier : la recherche en retourne desormais deux.
    produits.push({ id: 99, nom: 'Clavier compact', categorie: 'Périphériques', prix: 39, stock: 5 });
    await route.fulfill({ json: produits });
  });

  await page.goto('/');
  await page.getByLabel('Rechercher un produit').fill('clavier');
  await page.getByRole('button', { name: 'Rechercher' }).click();

  await expect(page.getByRole('listitem')).toHaveCount(1, { timeout: 2000 });
});
