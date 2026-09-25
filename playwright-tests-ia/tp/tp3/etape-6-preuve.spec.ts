import { test, expect } from '@playwright/test';
import { ConnexionPage } from './ConnexionPage';

/**
 * TP 3 · ETAPE 6 — prouver.
 *
 * L'enonce demande dix executions consecutives, dix fois vert :
 *
 *   node lancer.js tp3-etapes --repeat-each=10
 *
 * Pourquoi dix et pas une : un test instable passe la plupart du temps. Une
 * execution verte ne prouve rien ; c'est la REPETITION qui prouve. Si la suite
 * corrigee tient dix fois, la cause a ete traitee, pas masquee.
 *
 * Le contraste a montrer en restitution :
 *
 *   node lancer.js tp3            4 rouges + 1 intermittent, environ 2 min
 *   node lancer.js tp3-corrige    7 verts, environ 6 s
 *
 * Deux minutes contre six secondes, pour une couverture equivalente. Une suite
 * mal ecrite n'est pas seulement instable : elle est aussi quinze fois plus
 * lente, parce que les attentes fixes se paient a chaque execution.
 *
 * Ce fichier reprend le parcours complet, une fois toutes les corrections
 * appliquees. C'est ce qui doit tenir dix fois de suite.
 */

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: 'consent', value: '1', domain: 'localhost', path: '/' },
  ]);
});

test('le parcours complet, corrige de bout en bout', async ({ page }) => {
  const connexion = new ConnexionPage(page);
  await connexion.seConnecter('client@demo.test', 'demo');

  await page.goto('/');
  await page.getByLabel('Rechercher un produit').fill('clavier');
  await page.getByRole('button', { name: 'Rechercher' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(1);

  await page.getByRole('listitem')
    .filter({ hasText: 'Clavier mécanique' })
    .getByRole('button', { name: 'Ajouter au panier' })
    .click();
  await expect(page.getByTestId('badge-panier')).toHaveText('1');

  await page.goto('/panier');
  await expect(page.getByTestId('total-panier')).toHaveText('49,00 €');

  await page.getByRole('button', { name: 'Commander' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vos commandes');
});
