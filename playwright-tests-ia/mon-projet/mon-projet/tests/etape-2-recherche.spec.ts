import { test, expect } from '@playwright/test';

/**
 * TP 1 · ETAPE 2 — saisir un terme dans la recherche.
 *
 * On commence le parcours. Deux gestes s'ajoutent : remplir un champ, cliquer
 * sur un bouton.
 *
 * CE QUI EST NOUVEAU
 *   - getByLabel : on cible le champ par son libelle, pas par son id. Le
 *     libelle est ce que percoit l'utilisateur, et il survit a une refonte du
 *     balisage.
 *   - getByRole('button', { name: ... }) : un bouton se designe par son role
 *     et son texte accessible.
 *   - une assertion sur le RESULTAT de la recherche. Sans elle, le test
 *     n'aurait rien verifie : il aurait seulement clique.
 */

test('rechercher « clavier » ne laisse qu\'un produit', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Rechercher un produit').fill('clavier');
  await page.getByRole('button', { name: 'Rechercher' }).click();

  // toHaveCount reessaie jusqu'a la valeur attendue : le catalogue est rendu
  // par le navigateur, il n'est donc pas la a l'instant ou le clic rend la main.
  await expect(page.getByRole('listitem')).toHaveCount(1);
});
