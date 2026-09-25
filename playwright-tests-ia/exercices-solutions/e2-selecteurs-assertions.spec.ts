import { test, expect } from '@playwright/test';

/* NIVEAU 2 · corrigé. */

/**
 * Exercice 6. Les trois défauts du test d'origine :
 *   1. « li:nth-child(2) » dépend de l'ordre du catalogue : ajouter un produit
 *      en tête décale tout.
 *   2. « .css-a1b2c3 » est une classe générée, régénérée à chaque démarrage
 *      du serveur : elle ne correspondra plus à rien demain.
 *   3. textContent() lit la valeur une seule fois, sans réessayer : le badge
 *      valant encore « 0 » à cet instant, l'assertion échoue par intermittence.
 */
test('e6 · réécrire un test aux sélecteurs fragiles', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('listitem')
    .filter({ hasText: 'Souris ergonomique' })
    .getByRole('button', { name: 'Ajouter au panier' })
    .click();

  await expect(page.getByTestId('badge-panier')).toHaveText('1');
});

test('e7 · lever une ambiguïté de locator', async ({ page }) => {
  await page.goto('/');

  const ambigu = page.getByRole('button', { name: 'Ajouter au panier' });

  // a) 8 produits, dont 1 en rupture qui affiche « Indisponible ».
  await expect(ambigu).toHaveCount(7);

  // b) Playwright refuse d'agir plutôt que de choisir au hasard.
  await expect(ambigu.click({ timeout: 2000 }))
    .rejects.toThrow(/strict mode violation/);

  // c) deux façons de viser précisément la Webcam HD.
  const parConteneur = page.getByRole('listitem')
    .filter({ hasText: 'Webcam HD' })
    .getByRole('button', { name: 'Ajouter au panier' });
  const parTestId = page.getByTestId('ajouter-6');

  await expect(parConteneur).toHaveCount(1);
  await expect(parTestId).toHaveCount(1);

  // et elles désignent bien le même élément
  await parConteneur.click();
  await expect(page.getByTestId('badge-panier')).toHaveText('1');
});

test('e8 · un produit en rupture n\'est pas commandable', async ({ page }) => {
  await page.goto('/');

  const carte = page.getByRole('listitem').filter({ hasText: 'Casque antibruit' });
  const bouton = carte.getByRole('button');

  await expect(bouton).toHaveText('Indisponible');
  await expect(bouton).toBeDisabled();

  await page.getByRole('link', { name: 'Casque antibruit' }).click();
  await expect(page.getByTestId('stock')).toHaveText('Rupture de stock');
});

test('e9 · le panier affiche les lignes et le total', async ({ page }) => {
  await page.goto('/');

  for (const produit of ['Clavier mécanique', 'Souris ergonomique']) {
    await page.getByRole('listitem')
      .filter({ hasText: produit })
      .getByRole('button', { name: 'Ajouter au panier' })
      .click();
    // On attend la confirmation avant l'ajout suivant : le bouton du produit
    // est désactivé pendant l'appel, et l'on veut un état stable.
    await expect(page.getByTestId('confirmation')).toBeVisible();
  }

  await page.getByRole('link', { name: /Panier/ }).click();

  await expect(page.getByTestId('total-panier')).toHaveText('78,00 €');
  // 2 lignes de produits, plus la ligne d'en-tête du tableau.
  await expect(page.getByRole('row')).toHaveCount(3);
  await expect(page.getByRole('row', { name: /Clavier mécanique/ })).toBeVisible();
});

/**
 * Exercice 10. Pourquoi le premier échoue et pas le second :
 * textContent() interroge le DOM une seule fois, à l'instant où la ligne
 * s'exécute. Le badge n'a pas encore été rafraîchi, il vaut « 0 ».
 * expect(locator).toHaveText() interroge en boucle pendant 5 secondes,
 * et se satisfait dès que la valeur attendue apparaît.
 */
test.fail('e10a · lire la valeur à la main échoue', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('ajouter-1').click();

  const texte = await page.getByTestId('badge-panier').textContent();
  expect(texte).toBe('1');   // vaut encore « 0 » à cet instant
});

test('e10b · l\'assertion web-first attend la mise à jour', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('ajouter-1').click();

  await expect(page.getByTestId('badge-panier')).toHaveText('1');
});
