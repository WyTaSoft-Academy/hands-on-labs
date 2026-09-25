import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * TP 4 · ETAPE 2 — la fixture « pageConnectee ».
 *
 * Trois tests avaient besoin d'une session ouverte. Sans fixture, chacun
 * recopie les quatre memes lignes de connexion. Une fixture les factorise, et
 * surtout : elle s'execute AVANT le test, et son nettoyage s'execute meme si le
 * test echoue.
 *
 * POURQUOI PAR API et non par le formulaire : preparer un test en traversant
 * l'interface, c'est tester la connexion une fois de plus a chaque test. Plus
 * lent, et plus fragile — une refonte du formulaire ferait echouer vingt tests
 * qui ne parlent pas de connexion.
 *
 * La connexion par l'interface garde bien sur son propre test, ailleurs : c'est
 * un comportement a verifier, pas une preparation.
 */

type Fixtures = { pageConnectee: Page };

const test = base.extend<Fixtures>({
  pageConnectee: async ({ page }, use) => {
    const r = await page.request.post('/api/connexion', {
      data: { email: 'client@demo.test', mdp: 'demo' },
    });
    expect(r.ok()).toBeTruthy();

    await page.goto('/');
    await use(page);

    // Nettoyage : il s'execute meme si le test a echoue.
    await page.request.delete('/api/panier').catch(() => {});
  },
});

test('l\'utilisateur connecte voit son nom', async ({ pageConnectee }) => {
  await expect(pageConnectee.getByTestId('utilisateur')).toHaveText('Marie DUPONT');
});

test('l\'utilisateur connecte peut commander', async ({ pageConnectee }) => {
  await pageConnectee.request.post('/api/panier', { data: { id: 1 } });

  await pageConnectee.goto('/panier');
  await expect(pageConnectee.getByTestId('total-panier')).toHaveText('49,00 €');

  await pageConnectee.getByRole('button', { name: 'Commander' }).click();
  await expect(pageConnectee.getByRole('heading', { level: 1 })).toHaveText('Vos commandes');
});
