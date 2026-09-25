import { test, expect } from '@playwright/test';

/**
 * MODULE 2, annexe : le bandeau de consentement qui surgit n'importe quand.
 *
 * A LANCER AVEC LE BANDEAU ACTIF :
 *   DEMO_BANNIERE=1 npx playwright test specs/m2-interruptions.spec.ts
 *
 * Le bandeau apparait entre 200 et 1600 ms apres le chargement et recouvre
 * le bas de la page. Sans traitement, le test echoue une fois sur deux.
 */

test.describe('Interruptions imprevisibles', () => {

  test('le gestionnaire ferme le bandeau automatiquement', async ({ page }) => {
    // Declare une fois : Playwright s'en sert des que le bandeau gene une action.
    await page.addLocatorHandler(
      page.getByRole('dialog', { name: 'Cookies' }),
      async (dialogue) => {
        await dialogue.getByRole('button', { name: 'Accepter' }).click();
      },
    );

    await page.goto('/');
    await page.getByTestId('ajouter-1').click();
    await expect(page.getByTestId('badge-panier')).toHaveText('1');
  });

  test('la meilleure reponse : supprimer la cause', async ({ browser }) => {
    // Le cookie de consentement est pose avant le chargement : pas de bandeau.
    const context = await browser.newContext();
    await context.addCookies([
      { name: 'consent', value: '1', domain: 'localhost', path: '/' },
    ]);
    const page = await context.newPage();

    await page.goto('/');
    await page.getByTestId('ajouter-1').click();
    await expect(page.getByTestId('badge-panier')).toHaveText('1');

    await context.close();
  });
});
