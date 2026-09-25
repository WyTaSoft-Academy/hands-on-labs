import { test, expect } from '@playwright/test';

/**
 * TP 3 · ETAPE 2 — famille « timing ».
 *
 * Le test d'origine :
 *
 *   await page.goto('http://localhost:3000');   // URL en dur
 *   await page.waitForTimeout(1500);            // « pour laisser charger »
 *   await page.locator('...').click();
 *   await page.waitForTimeout(1000);            // « pour laisser le badge »
 *   const badge = await page.locator('.badge').textContent();
 *   expect(badge).toBe('1');
 *
 * Deux attentes fixes et une lecture faite a la main. Les attentes rendent le
 * test lent en permanence et instable quand la machine rame ; la lecture, elle,
 * ne reessaie pas.
 *
 * LE CORRECTIF n'ajoute rien : il RETIRE. Les deux waitForTimeout sautent, et
 * l'assertion web-first absorbe seule la latence de 350 ms du badge.
 */

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: 'consent', value: '1', domain: 'localhost', path: '/' },
  ]);
});

test('ajouter un article met le badge du panier a jour', async ({ page }) => {
  await page.goto('/');   // baseURL est configure : pas d'URL en dur

  await page.getByRole('listitem')
    .filter({ hasText: 'Clavier mécanique' })
    .getByRole('button', { name: 'Ajouter au panier' })
    .click();

  await expect(page.getByTestId('badge-panier')).toHaveText('1');
});

/** La preuve que la lecture a la main est bien la cause, et pas le hasard. */
test.fail('la lecture a la main echoue, meme sans rien changer d\'autre', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('listitem')
    .filter({ hasText: 'Clavier mécanique' })
    .getByRole('button', { name: 'Ajouter au panier' })
    .click();

  // textContent() photographie l'instant present : le badge vaut encore '0'.
  const badge = await page.getByTestId('badge-panier').textContent();
  expect(badge).toBe('1');
});
