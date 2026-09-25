// spec: specs/panier.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Panier', () => {
  test('Retrait d\'un produit parmi plusieurs dans le panier', async ({ page }) => {
    // La bannière de cookies ("Vos preferences de confidentialite") apparaît de façon
    // intermittente, avec un délai aléatoire, sur le catalogue et les pages produit.
    // On enregistre un handler avant la navigation pour l'accepter dès qu'elle surgit,
    // sans faire échouer le test si elle n'apparaît pas.
    const bannièreCookies = page.getByRole('dialog', { name: 'Cookies' });
    await page.addLocatorHandler(bannièreCookies, async () => {
      await bannièreCookies.getByRole('button', { name: 'Accepter', exact: true }).click();
    });

    await page.goto('/');

    // 1. Depuis le catalogue, ajouter "Clavier mécanique" (49,00 €) puis "Souris ergonomique" (29,00 €) au panier.
    await page.getByTestId('ajouter-1').click();
    await page.getByTestId('ajouter-2').click();
    await expect(page.getByRole('link', { name: 'Panier2' })).toBeVisible();

    // 2. Aller sur la page /panier.
    await page.goto('/panier');
    const table = page.getByRole('table');
    await expect(table.locator('tbody tr')).toHaveCount(2);
    await expect(page.getByRole('heading', { name: 'Total : 78,00 €' })).toBeVisible();

    // 3. Cliquer sur le bouton "Retirer" de la ligne "Souris ergonomique".
    const sourisRow = page.getByRole('row', { name: 'Souris ergonomique 1 29,00 €' });
    await sourisRow.getByRole('button', { name: 'Retirer' }).click();
    await expect(sourisRow).not.toBeVisible();

    const clavierRow = page.getByRole('row', { name: 'Clavier mécanique 1 49,00 €' });
    await expect(clavierRow).toBeVisible();
    await expect(table.locator('tbody tr')).toHaveCount(1);

    await expect(page.getByRole('heading', { name: 'Total : 49,00 €' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Panier1' })).toBeVisible();
  });
});
