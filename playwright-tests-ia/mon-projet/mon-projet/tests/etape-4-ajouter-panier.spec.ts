import { test, expect } from '@playwright/test';

/**
 * TP 1 · ETAPE 4 — ajouter l'article au panier.
 *
 * L'etape la plus interessante du TP, parce qu'elle contient un piege que
 * personne ne voit venir.
 *
 * Le badge du panier est mis a jour 350 ms APRES le clic. Le reflexe est
 * d'ajouter une attente. Il n'en faut aucune : l'assertion reessaie jusqu'a la
 * valeur attendue, et s'arrete des qu'elle l'obtient.
 *
 * A ESSAYER EN SEANCE, c'est le meilleur moment du TP :
 *
 *   const badge = await page.getByTestId('badge-panier').textContent();
 *   expect(badge).toBe('1');            // ECHOUE : lit '0', une seule fois
 *
 * La premiere forme attend, la seconde photographie. C'est tout le module 2,
 * rencontre ici pour de vrai avant d'etre explique.
 */

test('ajouter au panier depuis la fiche met le badge a jour', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Rechercher un produit').fill('clavier');
  await page.getByRole('button', { name: 'Rechercher' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(1);

  await page.getByRole('listitem').first().getByRole('link').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Clavier mécanique');

  await page.getByRole('button', { name: 'Ajouter au panier' }).click();

  // Aucune attente ecrite. L'assertion absorbe seule les 350 ms.
  await expect(page.getByTestId('badge-panier')).toHaveText('1');
});
