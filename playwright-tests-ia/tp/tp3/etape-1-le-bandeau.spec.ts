import { test, expect } from '@playwright/test';

/**
 * TP 3 · ETAPE 1 — diagnostiquer, et traiter la CAUSE.
 *
 * C'est le premier defaut qu'on rencontre, parce que c'est le seul qui echoue
 * « une fois sur deux ». L'enonce le dit : lancez la suite plusieurs fois et
 * relevez lesquels sont instables.
 *
 *   node lancer.js tp3 --repeat-each=5
 *
 * LA CAUSE, lisible dans la trace : un bandeau de consentement apparait entre
 * 60 et 760 ms apres le chargement et recouvre la page. Le clic part avant, ou
 * apres, selon l'humeur de la machine. Le journal d'appels le nomme :
 *
 *   <div role="dialog" ... id="banniere-cookies"> intercepts pointer events
 *
 * TROIS REPONSES POSSIBLES, de la pire a la meilleure :
 *
 *   1. waitForTimeout(800) avant chaque clic.
 *      Interdit par l'enonce, et a raison : le delai est aleatoire, donc le
 *      test reste instable — simplement moins souvent.
 *
 *   2. addLocatorHandler : Playwright ferme le bandeau des qu'il apparait.
 *      Correct, et c'est la bonne reponse quand on ne peut PAS supprimer la
 *      cause. Elle est montree en annexe du module 2.
 *
 *   3. Supprimer la cause : poser le cookie de consentement avant d'arriver.
 *      Le bandeau n'apparait jamais. C'est ce qu'on fait ici.
 *
 * Le serveur decide d'afficher le bandeau avec « BANNIERE && !cookies.consent ».
 * Poser le cookie le desactive donc a la source, cote serveur, et pas seulement
 * a l'ecran.
 */

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: 'consent', value: '1', domain: 'localhost', path: '/' },
  ]);

  // La variante quand on ne peut pas toucher a la cause :
  // await page.addLocatorHandler(
  //   page.getByRole('dialog', { name: 'Cookies' }),
  //   async (d) => d.getByRole('button', { name: 'Accepter' }).click(),
  // );
});

test('trois ajouts successifs donnent un badge a trois', async ({ page }) => {
  await page.goto('/');

  for (const produit of ['Clavier mécanique', 'Souris ergonomique', 'Station d\'accueil']) {
    await page.getByRole('listitem')
      .filter({ hasText: produit })
      .getByRole('button', { name: 'Ajouter au panier' })
      .click();
  }

  await expect(page.getByTestId('badge-panier')).toHaveText('3');
});
