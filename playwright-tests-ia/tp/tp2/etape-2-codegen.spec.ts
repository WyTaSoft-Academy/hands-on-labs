import { test, expect } from '@playwright/test';

/**
 * TP 2 · ETAPE 2 — Codegen : enregistrer, puis nettoyer.
 *
 *   node ../app/serveur.js        dans un terminal
 *   npm run codegen               dans un autre
 *
 * Codegen produit du code correct et sans interet : il enregistre des GESTES,
 * il ne sait pas ce que vous vouliez VERIFIER.
 *
 * Les deux tests ci-dessous passent tous les deux. C'est precisement le point
 * de l'etape : vert ne veut pas dire bon.
 */

/* CE QUE CODEGEN PRODUIT, a peine retouche.
   Trois defauts, a faire trouver par le groupe avant de les nommer :
     1. le nom ne decrit rien
     2. aucune assertion metier — seulement un titre de page
     3. le parcours est decrit geste par geste, sans intention lisible */
test('test', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Rechercher un produit').click();
  await page.getByLabel('Rechercher un produit').fill('clavier');
  await page.getByRole('button', { name: 'Rechercher' }).click();
  await page.getByRole('link', { name: 'Clavier mécanique' }).click();
  await page.getByRole('button', { name: 'Ajouter au panier' }).click();
  await expect(page).toHaveTitle(/Boutique interne/);
});

/* LA MEME CHOSE, NETTOYEE.
   Le nom dit le comportement, les gestes inutiles sautent, et l'assertion
   porte sur ce qui compte : l'article est bien dans le panier. */
test('ajouter un clavier depuis sa fiche le place dans le panier', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Rechercher un produit').fill('clavier');
  await page.getByRole('button', { name: 'Rechercher' }).click();
  await page.getByRole('link', { name: 'Clavier mécanique' }).click();

  await page.getByRole('button', { name: 'Ajouter au panier' }).click();
  await expect(page.getByTestId('badge-panier')).toHaveText('1');
});
