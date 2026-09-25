import { test, expect } from '@playwright/test';

/**
 * MODULE 4 : reutiliser une session authentifiee.
 *
 * Ce fichier tourne dans le projet « avec-session », qui declare
 * storageState: '.auth/client.json'. Aucun formulaire de connexion n'est joue :
 * les tests demarrent deja connectes.
 *
 * Ces tests sont volontairement en LECTURE SEULE : storageState partage la
 * session serveur, donc tout test qui modifierait le panier casserait
 * l'isolation. Voir le commentaire de fixtures/test-base.ts.
 */

test('la session est deja ouverte, sans passer par le formulaire', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('utilisateur')).toHaveText('Marie DUPONT');
  await expect(page.getByRole('link', { name: 'Se deconnecter' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Se déconnecter' })).toBeVisible();
});

test('la page des commandes est accessible directement', async ({ page }) => {
  await page.goto('/commandes');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vos commandes');
  await expect(page.getByRole('link', { name: 'Exporter en CSV' })).toBeVisible();
});

test('un client n\'accede pas a l\'ecran de validation', async ({ page }) => {
  await page.goto('/validations');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Accès refusé');
});
