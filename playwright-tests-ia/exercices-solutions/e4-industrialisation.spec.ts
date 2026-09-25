import { test as base, expect } from '@playwright/test';
import * as fs from 'fs';

/* NIVEAU 4 · corrigé. */

/**
 * Exercice 19. La fixture ouvre une session par API et laisse le panier propre,
 * avant ET après le test. Le code placé après « await use() » s'exécute même
 * si le test échoue.
 */
const test = base.extend<{ connecte: void }>({
  connecte: async ({ page }, use) => {
    const r = await page.request.post('/api/connexion', {
      data: { email: 'client@demo.test', mdp: 'demo' },
    });
    expect(r.ok()).toBeTruthy();
    await page.request.delete('/api/panier');

    await use();

    await page.request.delete('/api/panier');
  },
});

test('e16 · catalogue vide, le message adapté s\'affiche', async ({ page }) => {
  // La route doit être posée AVANT la navigation qui déclenche l'appel.
  await page.route('**/api/produits*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    }),
  );

  await page.goto('/');

  await expect(page.getByText('Aucun produit ne correspond')).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

test('e17a · erreur serveur, la page reste utilisable', async ({ page }) => {
  await page.route('**/api/produits*', (route) =>
    route.fulfill({ status: 500, body: '{"erreur":"indisponible"}' }),
  );

  await page.goto('/');

  await expect(page.getByRole('alert'))
    .toHaveText('Le catalogue est momentanément indisponible.');
  // Le vrai sujet : une panne du catalogue ne doit pas casser la navigation.
  await expect(page.getByRole('link', { name: /Panier/ })).toBeVisible();
});

test('e17b · panne réseau, la page reste utilisable', async ({ page }) => {
  await page.route('**/api/produits*', (route) => route.abort());

  await page.goto('/');

  await expect(page.getByRole('alert'))
    .toHaveText('Le catalogue est momentanément indisponible.');
  await expect(page.getByRole('link', { name: /Panier/ })).toBeVisible();
});

test('e18 · le panier préparé par API s\'affiche à l\'écran', async ({ page }) => {
  // page.request partage les cookies de la page, donc la même session serveur.
  // La fixture « request » de Playwright, elle, a son propre bocal à cookies.
  await page.request.post('/api/panier', { data: { id: 3 } });
  await page.request.post('/api/panier', { data: { id: 3 } });

  await page.goto('/panier');
  await expect(page.getByTestId('total-panier')).toHaveText('578,00 €');
});

test('e19 · la page des commandes est accessible une fois connecté',
  async ({ page, connecte }) => {
    await page.goto('/commandes');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vos commandes');
    await expect(page.getByRole('link', { name: 'Exporter en CSV' })).toBeVisible();
  });

test('e20 · l\'export CSV est bien formé et bien encodé',
  async ({ page, connecte }) => {
    // Préparation par API : plus rapide et plus sûr que par l'interface.
    await page.request.post('/api/panier', { data: { id: 2 } });
    const commande = await page.request.post('/api/commandes', { data: {} });
    expect(commande.status()).toBe(201);

    await page.goto('/commandes');

    const [fichier] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('link', { name: 'Exporter en CSV' }).click(),
    ]);

    // a) le nom proposé
    expect(fichier.suggestedFilename()).toBe('commandes.csv');

    const contenu = await fs.promises.readFile(await fichier.path(), 'utf8');
    const lignes = contenu.trim().split('\n');

    // b) l'en-tête
    expect(lignes[0]).toBe('reference;client;montant;statut');
    // c) le contenu, pas seulement la taille du fichier
    expect(contenu).toContain('Marie DUPONT');
    // d) l'encodage : lancez « node lancer.js csv-casse », ceci doit virer au rouge
    expect(contenu).not.toContain('�');
  });
