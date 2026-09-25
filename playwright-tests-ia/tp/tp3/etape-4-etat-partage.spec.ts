import { test, expect } from '@playwright/test';

/**
 * TP 3 · ETAPE 4 — famille « etat partage ». La plus grave des trois.
 *
 * Le test d'origine :
 *
 *   let totalAttendu = 0;                       // variable de module
 *
 *   test('test 1', ...  { totalAttendu = 49; });
 *   test('test 2', async ({ page }) => {
 *     await page.goto('http://localhost:3000/panier');
 *     const total = await page.locator('[data-testid=total-panier]').textContent();
 *     expect(total).toBe(`${totalAttendu},00 €`);
 *   });
 *
 * Le test 2 depend du test 1 de DEUX facons, et les deux sont fausses :
 *   - il lit une variable que le test 1 a ecrite, donc l'ordre compte ;
 *   - il suppose que le panier contient l'article ajoute par le test 1, alors
 *     que chaque test recoit un CONTEXTE NEUF, donc une session vide.
 *
 * Le symptome trompeur : la suite passe parfois en entier, et echoue des qu'on
 * lance un test seul, qu'on change l'ordre, ou qu'on parallelise. C'est le
 * defaut qui coute le plus cher a diagnostiquer.
 *
 * LE CORRECTIF : le test cree lui-meme l'etat dont il a besoin. Par API, parce
 * que passer par l'interface pour PREPARER un test, c'est tester deux fois la
 * meme chose et doubler la duree.
 */

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: 'consent', value: '1', domain: 'localhost', path: '/' },
  ]);
});

test('le panier affiche le total des articles ajoutes', async ({ page }) => {
  await page.request.post('/api/panier', { data: { id: 1 } });

  await page.goto('/panier');
  await expect(page.getByTestId('total-panier')).toHaveText('49,00 €');
});

/** Le meme test sans sa preparation : le panier est vide, il n'y a pas de total. */
test.fail('sans preparation, le test ne trouve aucun total', async ({ page }) => {
  await page.goto('/panier');
  await expect(page.getByTestId('total-panier')).toHaveText('49,00 €', { timeout: 1500 });
});
