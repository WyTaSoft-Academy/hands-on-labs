import { test, expect } from '@playwright/test';

/**
 * TP 1 · ETAPE 1 — le fichier minimal qui fait quelque chose.
 *
 * Livrable 2 de l'enonce : « un test qui ouvre la page d'accueil et verifie
 * son titre ».
 *
 * Trois lignes, et deja tout ce qu'il faut comprendre :
 *   - « test(...) » declare un cas ; le nom decrit un COMPORTEMENT
 *   - « { page } » est fourni par Playwright : un onglet neuf, isole
 *   - « await » devant chaque action, sans exception
 */

test('la page d\'accueil affiche le catalogue de la boutique', async ({ page }) => {
  // baseURL est dans la configuration : '/' suffit, et le test reste valable
  // quand l'application change d'adresse.
  await page.goto('/');

  await expect(page).toHaveTitle(/Boutique interne/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nos produits');
});
