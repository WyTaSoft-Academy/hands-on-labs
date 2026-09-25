import { test, expect } from '@playwright/test';

/**
 * TP 4 · ETAPE 4 — elargir a Firefox et WebKit.
 *
 * Le meme fichier, rejoue sur trois moteurs. Rien a changer dans le test :
 * tout se passe dans la configuration.
 *
 *   node lancer.js tp4                 Chromium seul
 *   node lancer.js tp4-navigateurs     les trois moteurs
 *
 * Prerequis : npx playwright install chromium firefox webkit
 *
 * LE PIEGE DE CONFIGURATION, a montrer : sans « testMatch » sur les projets
 * firefox et webkit, ils ramassent TOUTES les specs, y compris celles qui
 * dependent d'une session preparee par un projet qui ne tourne que sur
 * Chromium. On obtient alors des echecs qui n'ont rien a voir avec le
 * navigateur.
 *
 * CE QUE CA RAPPORTE VRAIMENT : sur cette application, activer Firefox a sorti
 * deux bugs reels invisibles sur Chromium — un message de confirmation qui ne
 * se reinitialisait pas, et des boutons rendus avant que leur gestionnaire de
 * clic ne soit declare. Les deux sont corriges. C'est la reponse concrete a
 * « a quoi sert une campagne multi-navigateurs ».
 */

test('le parcours d\'achat tient sur les trois moteurs', async ({ page }, testInfo) => {
  await page.goto('/');

  await page.getByRole('listitem')
    .filter({ hasText: 'Clavier mécanique' })
    .getByRole('button', { name: 'Ajouter au panier' })
    .click();
  await expect(page.getByTestId('badge-panier')).toHaveText('1');

  await page.getByRole('listitem')
    .filter({ hasText: 'Souris ergonomique' })
    .getByRole('button', { name: 'Ajouter au panier' })
    .click();
  await expect(page.getByTestId('badge-panier')).toHaveText('2');

  await page.getByRole('link', { name: /Panier/ }).click();
  await expect(page.getByTestId('total-panier')).toHaveText('78,00 €');

  // Le nom du projet apparait dans le rapport : utile pour montrer que le
  // meme test a bien tourne trois fois.
  await testInfo.attach('moteur', { body: testInfo.project.name });
});

test('la recherche tient sur les trois moteurs', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Rechercher un produit').fill('écran');
  await page.getByRole('button', { name: 'Rechercher' }).click();

  await expect(page.getByRole('listitem')).toHaveCount(2);
});
