import { test, expect } from '@playwright/test';

/**
 * TP 2 · ETAPE 3 — le test genere par l'IA, tel quel.
 *
 * LE PROMPT QUI A SERVI, a montrer en entier : c'est lui le livrable de
 * l'etape, pas le code.
 *
 *   Contexte : boutique interne, Playwright 1.63, TypeScript.
 *   DOM : <li> par produit, bouton « Ajouter au panier », badge
 *         data-testid="badge-panier", total data-testid="total-panier".
 *   Scenario : ajouter deux produits differents, ouvrir le panier,
 *              verifier le total.
 *   Contraintes : locators par role ou label, aucune attente fixe,
 *                 une assertion metier au moins.
 *
 * Ce qui revient TOUJOURS dans la reponse, meme avec un bon prompt :
 *   - une attente fixe « pour etre sur »
 *   - une assertion sur la presence d'un element plutot que sur sa valeur
 *   - un selecteur CSS la ou un role existe
 *
 * Ce fichier garde la reponse SANS LA CORRIGER. L'etape 4 la reprend.
 */

test.fail('genere par IA : ajouter deux produits et verifier le total', async ({ page }) => {
  await page.goto('/');

  // L'IA a mis une attente fixe. Elle ne sert a rien ici, et elle masquera un
  // vrai probleme le jour ou l'application ralentira.
  await page.waitForTimeout(500);

  await page.locator('li').filter({ hasText: 'Clavier mécanique' })
    .getByRole('button').click();
  await page.locator('li').filter({ hasText: 'Souris ergonomique' })
    .getByRole('button').click();

  await page.getByRole('link', { name: /Panier/ }).click();

  // L'ERREUR DE FOND : le total de 49,00 € + 29,00 € vaut 78,00 €.
  // L'IA a additionne sans verifier le catalogue. Elle a produit un test qui
  // a l'air juste, et qui affirme quelque chose de faux.
  await expect(page.getByTestId('total-panier')).toHaveText('68,00 €', { timeout: 2000 });
});
