import { test, expect } from '@playwright/test';

/**
 * TP 1 · ETAPE 5 — le parcours complet. C'est le corrige.
 *
 * Le fichier tel qu'il doit etre rendu : les deux livrables de l'enonce, le
 * test du titre et le parcours de bout en bout.
 *
 * CE QUI EST NOUVEAU
 *   - on ne s'arrete pas au compteur de l'en-tete : on ouvre le panier et on
 *     verifie ce qu'il contient reellement. Un badge a « 1 » et un panier vide
 *     seraient parfaitement compatibles avec un bug.
 *   - test.step (facultatif) : les etapes apparaissent nommees et repliables
 *     dans le mode UI et dans la trace. C'est le module 3 qui s'annonce.
 *
 * Ce n'est PAS la seule redaction correcte. Toute solution qui respecte les
 * points de vigilance de l'enonce -- un await devant chaque action, au moins
 * une assertion par test, des noms qui decrivent un comportement -- est bonne.
 */

test('la page d\'accueil affiche le catalogue de la boutique', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Boutique interne/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nos produits');
});

test('rechercher un clavier, ouvrir sa fiche et l\'ajouter au panier', async ({ page }) => {
  await test.step('arriver sur la page d\'accueil', async () => {
    await page.goto('/');
  });

  await test.step('rechercher « clavier »', async () => {
    await page.getByLabel('Rechercher un produit').fill('clavier');
    await page.getByRole('button', { name: 'Rechercher' }).click();
    await expect(page.getByRole('listitem')).toHaveCount(1);
  });

  await test.step('ouvrir le premier resultat', async () => {
    await page.getByRole('listitem').first().getByRole('link').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Clavier mécanique');
  });

  await test.step('ajouter l\'article au panier', async () => {
    await page.getByRole('button', { name: 'Ajouter au panier' }).click();
    await expect(page.getByTestId('badge-panier')).toHaveText('1');
  });

  await test.step('verifier que le panier affiche un article', async () => {
    await page.getByRole('link', { name: /Panier/ }).click();
    await expect(page.getByRole('cell', { name: 'Clavier mécanique' })).toBeVisible();
    await expect(page.getByTestId('total-panier')).toHaveText('49,00 €');
  });
});
