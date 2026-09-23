/**
 * TP 2 — VARIANTE B, sans assistant IA sur les postes.
 *
 * Ces cinq tests sont ce qu'un assistant rend quand on lui demande
 * « ecris-moi des tests Playwright pour cette boutique » sans rien lui donner
 * d'autre. Ils sont plausibles, bien indentes, et pourtant inexploitables.
 *
 * Votre travail : passer chacun a la checklist du module 2, dire ce qui ne va
 * pas, et le reecrire. Le corrige est presente en seance.
 *
 *   node lancer.js tp2-variante-b
 */
import { test, expect } from '@playwright/test';

/* --------------------------------------------------------------------------
   1. Il passe. Que verifie-t-il exactement ?
   -------------------------------------------------------------------------- */
test('la page d\'accueil fonctionne', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.*/);
});

/* --------------------------------------------------------------------------
   2. Trois defauts dans quatre lignes.
   -------------------------------------------------------------------------- */
test('ajouter un produit au panier', async ({ page }) => {
  await page.goto('/');
  await page.locator('.btn.btn-primary').first().click();
  await page.waitForTimeout(2000);
  const badge = await page.locator('.badge').textContent();
  expect(badge).toBe('1');
});

/* --------------------------------------------------------------------------
   3. Le selecteur vient du code source de la page, releve un jour donne.
   -------------------------------------------------------------------------- */
test('rechercher un produit', async ({ page }) => {
  await page.goto('/');
  await page.locator('#q').fill('clavier');
  await page.locator('.css-a1b2c3').first().click();
  await expect(page.locator('ul.produits li')).toHaveCount(1);
});

/* --------------------------------------------------------------------------
   4. Il passe systematiquement. Regardez la duree d'execution.
   -------------------------------------------------------------------------- */
test('le panier se met a jour', async ({ page }) => {
  await page.goto('/');
  page.getByTestId('ajouter-1').click();
  expect(page.getByTestId('badge-panier')).toBeVisible();
});

/* --------------------------------------------------------------------------
   5. Cette methode existe-t-elle vraiment ?
   -------------------------------------------------------------------------- */
test('le produit affiche son prix', async ({ page }) => {
  await page.goto('/produit?id=1');
  const prix = page.getByTestId('prix');
  // @ts-expect-error : methode inventee, conservee volontairement
  await expect(prix).toHaveTextContent('49,00 €');
});
