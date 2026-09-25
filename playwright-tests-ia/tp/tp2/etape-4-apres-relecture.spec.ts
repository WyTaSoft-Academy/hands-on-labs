import { test, expect } from '@playwright/test';

/**
 * TP 2 · ETAPE 4 — le meme test, apres relecture.
 *
 * Quatre corrections, dans cet ordre :
 *
 *   1. L'ATTENTE FIXE saute. Elle ne reglait rien : les assertions attendent
 *      deja. C'est la correction la plus facile et la plus rentable.
 *   2. LE TOTAL est verifie contre le catalogue reel : 49,00 + 29,00 = 78,00.
 *      C'est la seule erreur que la relecture DEVAIT attraper, et c'est celle
 *      qu'un test vert aurait cachee pour toujours.
 *   3. LE SELECTEUR « li » devient getByRole('listitem') : la meme chose, dite
 *      dans le vocabulaire de l'utilisateur.
 *   4. LE BOUTON est nomme. getByRole('button') seul marchait ici par chance,
 *      parce que la carte n'en contient qu'un.
 *
 * A dire en restitution : sur ce parcours, l'IA a produit la structure en
 * quelques secondes et une erreur de calcul qu'il a fallu quatre minutes a
 * trouver. Le gain est reel, la relecture n'est pas optionnelle.
 */

test('ajouter deux produits met le panier au bon total', async ({ page }) => {
  await page.goto('/');

  for (const produit of ['Clavier mécanique', 'Souris ergonomique']) {
    await page.getByRole('listitem')
      .filter({ hasText: produit })
      .getByRole('button', { name: 'Ajouter au panier' })
      .click();
  }

  await expect(page.getByTestId('badge-panier')).toHaveText('2');

  await page.getByRole('link', { name: /Panier/ }).click();
  await expect(page.getByTestId('total-panier')).toHaveText('78,00 €');
});
