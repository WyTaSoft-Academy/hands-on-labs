import { test, expect } from '@playwright/test';

/**
 * TP 3 · ETAPE 3 — famille « selecteur ».
 *
 * Trois formes de fragilite, dans la suite d'origine :
 *
 *   .css-a1b2c3                        accroche au STYLE   -> deja mort
 *   ul.produits li:nth-child(1)        POSITIONNEL         -> casse si l'ordre change
 *   input[type=email], form button     TECHNIQUE           -> un label existait
 *
 * Aucune des trois ne dit ce que l'utilisateur voit. La correction consiste a
 * remonter d'un cran : du balisage vers l'INTENTION.
 */

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: 'consent', value: '1', domain: 'localhost', path: '/' },
  ]);
});

test('la recherche ne retourne que les produits correspondants', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Rechercher un produit').fill('clavier');
  await page.getByRole('button', { name: 'Rechercher' }).click();

  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Clavier mécanique' })).toBeVisible();
});

test('la connexion affiche le nom de l\'utilisateur', async ({ page }) => {
  await page.goto('/connexion');

  await page.getByLabel('Adresse email').fill('client@demo.test');
  await page.getByLabel('Mot de passe').fill('demo');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  // L'original se contentait de verifier que l'URL contenait « localhost ».
  // Cela restait vrai meme quand la connexion echouait.
  await expect(page.getByTestId('utilisateur')).toHaveText('Marie DUPONT');
});

/** Le cas symetrique, absent de la suite d'origine : l'echec doit etre teste aussi. */
test('la connexion refuse un mot de passe incorrect', async ({ page }) => {
  await page.goto('/connexion');

  await page.getByLabel('Adresse email').fill('client@demo.test');
  await page.getByLabel('Mot de passe').fill('mauvais');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await expect(page.getByRole('alert')).toHaveText('Identifiants incorrects');
});

/** La classe du bouton est regeneree a chaque demarrage du serveur. */
test.fail('le selecteur accroche au style ne correspond a rien', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.css-a1b2c3')).toHaveCount(1, { timeout: 1500 });
});
