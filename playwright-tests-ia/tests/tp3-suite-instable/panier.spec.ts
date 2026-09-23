import { test, expect } from '@playwright/test';

/**
 * SUITE VOLONTAIREMENT MAL ECRITE. Ne vous en inspirez pas.
 * Chaque test porte un defaut d'une des trois familles vues au module 3.
 */

// DEFAUT : etat partage. Cette variable survit d'un test a l'autre.
let totalAttendu = 0;

test('test 1', async ({ page }) => {
  // DEFAUT : URL en dur, alors que baseURL est configure.
  await page.goto('http://localhost:3000');

  // DEFAUT : attente fixe. Trop courte quand la machine rame, trop longue sinon.
  await page.waitForTimeout(1500);

  // DEFAUT : selecteur positionnel. Casse si l'ordre du catalogue change.
  await page.locator('ul.produits li:nth-child(1) button').click();

  await page.waitForTimeout(1000);

  // DEFAUT : assertion sur une valeur extraite. Ne reessaie pas.
  const badge = await page.locator('.badge').textContent();
  expect(badge).toBe('1');

  totalAttendu = 49;
});

test('test 2', async ({ page }) => {
  await page.goto('http://localhost:3000/panier');

  // DEFAUT : depend du test 1. Echoue si on lance ce test seul,
  // et le contexte est neuf de toute facon : le panier est vide.
  const total = await page.locator('[data-testid=total-panier]').textContent();
  expect(total).toBe(`${totalAttendu},00 €`);
});

test('recherche', async ({ page }) => {
  await page.goto('/');

  // DEFAUT : selecteur accroche au style, regenere a chaque demarrage du serveur.
  await page.locator('.css-a1b2c3').first().waitFor();

  await page.locator('#q').fill('clavier');
  await page.locator('form.recherche button').click();
  await page.waitForTimeout(800);

  const nb = await page.locator('ul.produits li').count();
  expect(nb).toBe(1);
});

test('connexion', async ({ page }) => {
  await page.goto('/connexion');

  // DEFAUT : selecteurs techniques la ou des labels existent.
  await page.locator('input[type=email]').fill('client@demo.test');
  await page.locator('input[type=password]').fill('demo');
  await page.locator('form button').click();

  await page.waitForTimeout(500);

  // DEFAUT : pas d'assertion sur le resultat, seulement sur l'URL.
  expect(page.url()).toContain('localhost:3000');
});

test('ajout multiple', async ({ page }) => {
  await page.goto('/');

  // DEFAUT : le bandeau de consentement recouvre les boutons a un instant
  // non deterministe. Ce test echoue une fois sur deux.
  await page.locator('[data-testid=ajouter-1]').click();
  await page.locator('[data-testid=ajouter-2]').click();
  await page.locator('[data-testid=ajouter-5]').click();

  await page.waitForTimeout(1200);
  const badge = await page.locator('[data-testid=badge-panier]').textContent();
  expect(badge).toBe('3');
});

test('commande', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid=ajouter-1]').click();
  await page.waitForTimeout(600);

  await page.goto('/panier');

  // DEFAUT : le bouton n'existe que si le panier n'est pas vide.
  // Aucune verification prealable, donc un message d'erreur incomprehensible.
  await page.locator('form[action="/commander"] button').click();

  await page.waitForTimeout(500);
  expect(await page.locator('h1').textContent()).toBe('Vos commandes');
});
