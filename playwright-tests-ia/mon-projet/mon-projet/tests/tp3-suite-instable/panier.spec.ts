import { test, expect } from '@playwright/test';

/**
 * SUITE VOLONTAIREMENT MAL ECRITE. Ne vous en inspirez pas.
 * Chaque test porte un defaut d'une des trois familles vues au module 3.
 */

// DEFAUT : etat partage. Cette variable survit d'un test a l'autre.
let totalAttendu = 0;

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([
    { name: 'consent', value: '1', domain: 'localhost', path: '/' },
  ]);
});

test('ajouter un article met le badge du panier à jour', async ({ page }) => {
  // DEFAUT : URL en dur, alors que baseURL est configure.

  await page.goto('/');

  // DEFAUT : selecteur positionnel. Casse si l'ordre du catalogue change.
  await page.getByRole('listitem')
  .filter({ hasText: 'Clavier mécanique' })
  .getByRole('button', { name: 'Ajouter au panier' }).click();

  await expect(page.getByTestId('badge-panier')).toHaveText('1');

});

test('le panier affiche le total des articles ajoutés', async ({ page }) => {
  
  await page.request.post('/api/panier', { data: { id: 1 } });

  await page.goto('/panier');


  await expect(page.getByTestId('total-panier')).toHaveText('49,00 €');
});

test('la recherche ne retourne que les produits correspondants', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Rechercher un produit').fill('clavier');
  await page.getByRole('button', { name: 'Rechercher' }).click();

   await expect(page.getByRole('listitem')).toHaveCount(1);
   await expect(page.getByRole('heading',{ name: 'Clavier mécanique' })).toBeVisible();
});

test('la connexion refuse un mot de passe incorrect', async ({ page }) => {
  await page.goto('/connexion');

  // DEFAUT : selecteurs techniques la ou des labels existent.
  await page.getByLabel('Adresse email').fill('client@demo.test');
  await page.getByLabel('Mot de passe').fill('demo');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await page.waitForTimeout(500);

  await expect(page.getByTestId('utilisateur')).toHaveText('Marie DUPONT');
  await expect(page.getByRole('link', { name: 'Se déconnecter' })).toBeVisible();
});

test('ajout multiple', async ({ page }) => {
  await page.goto('/');

  // DEFAUT : le bandeau de consentement recouvre les boutons a un instant
  // non deterministe. Ce test echoue une fois sur deux.
  for (const produit of ['Clavier mécanique', 'Souris ergonomique', 'Station d\'accueil']) {
      await page.getByRole('listitem')
      .filter({ hasText: produit })
      .getByRole('button', { name: 'Ajouter au panier' })
      .click();
  }

  await expect(page.getByTestId('badge-panier')).toHaveText('3');
});

test('commander vide le panier et crée la commande', async ({ page }) => {
  await page.goto('/connexion');
  await page.getByLabel('Adresse email').fill('client@demo.test');
  await page.getByLabel('Mot de passe').fill('demo');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  // DEFAUT : le bouton n'existe que si le panier n'est pas vide.
  // Aucune verification prealable, donc un message d'erreur incomprehensible.
  await page.request.post('/api/panier', { data: { id: 1 } });
  await page.goto('/panier');
  await expect(page.getByTestId('total-panier')).toHaveText('49,00 €');
 
  await page.getByRole('button', { name: 'Commander' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vos commandes');

  await expect(page.getByRole('row')).not.toHaveCount(0);

});