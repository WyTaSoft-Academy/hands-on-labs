import { test as base, expect } from '@playwright/test';
import { CataloguePage } from '../pages/CataloguePage';
import { PanierPage } from '../pages/PanierPage';

/**
 * MODULE 3 et 4 : fixtures maison.
 *
 * POURQUOI PAS storageState ICI
 * L'application garde le panier en session serveur. Partager un storageState
 * entre tests, c'est partager la session, donc le panier : deux tests paralleles
 * se marchent dessus. C'est exactement le defaut « etat partage » du module 3.
 *
 * La fixture « connecte » ouvre donc une session propre a chaque test, par API,
 * sans passer par le formulaire. Rapide, et reellement isole.
 * Le storageState reste demontre dans specs/m4-storagestate.spec.ts, sur des
 * tests en lecture seule.
 */
type Fixtures = {
  catalogue: CataloguePage;
  panier: PanierPage;
  connecte: { nom: string; role: string };
};

export const test = base.extend<Fixtures>({
  catalogue: async ({ page }, use) => {
    await use(new CataloguePage(page));
  },

  panier: async ({ page }, use) => {
    await use(new PanierPage(page));
  },

  connecte: [async ({ page }, use) => {
    const r = await page.request.post('/api/connexion', {
      data: { email: 'client@demo.test', mdp: 'demo' },
    });
    expect(r.ok()).toBeTruthy();
    await use(await r.json());
  }, { auto: true }],
});

export { expect };
