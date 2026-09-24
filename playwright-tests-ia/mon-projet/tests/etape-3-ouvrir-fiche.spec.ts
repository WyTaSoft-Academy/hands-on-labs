import { test, expect } from '@playwright/test';

/**
 * TP 1 · ETAPE 3 — ouvrir le premier resultat.
 *
 * CE QUI EST NOUVEAU
 *   - on navigue par un CLIC sur le lien du titre, comme le ferait un
 *     utilisateur, et non par une URL construite a la main. Un test qui appelle
 *     goto('/produit?id=1') ne verifie plus que le lien existe.
 *   - .first() sur une liste : legitime seulement parce que l'assertion
 *     precedente a etabli qu'il n'y a QU'UN resultat. Sans elle, « le premier »
 *     serait une hypothese jamais controlee.
 *   - le chainage de locators : listitem -> lien a l'interieur.
 */

test('ouvrir le premier resultat affiche sa fiche', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Rechercher un produit').fill('clavier');
  await page.getByRole('button', { name: 'Rechercher' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(1);

  await page.getByRole('listitem').first().getByRole('link').click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Clavier mécanique');
  await expect(page.getByTestId('prix')).toHaveText('49,00 €');
});
