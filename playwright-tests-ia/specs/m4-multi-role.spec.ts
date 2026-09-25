import { test, expect } from '@playwright/test';
import * as fs from 'fs';

/**
 * MODULE 4 et annexes : plusieurs rôles, deux utilisateurs en simultané,
 * téléchargement et contrôle du contenu d'un export.
 *
 * Chaque contexte ouvre sa propre session par API : deux tests parallèles ne
 * partagent donc aucun panier. Le seuil de validation est de 1000 € : une
 * commande au-dessus part en « En attente de validation ».
 */

/** Ouvre un contexte neuf, déjà authentifié, sans passer par le formulaire. */
async function contexteConnecte(browser: import('@playwright/test').Browser, email: string) {
  const contexte = await browser.newContext({ baseURL: 'http://localhost:3000' });
  const page = await contexte.newPage();
  const r = await page.request.post('/api/connexion', { data: { email, mdp: 'demo' } });
  expect(r.ok()).toBeTruthy();
  return { contexte, page };
}

test.describe('Habilitations', () => {

  test('un client ne peut pas ouvrir l\'écran de validation', async ({ browser }) => {
    const { contexte, page } = await contexteConnecte(browser, 'client@demo.test');

    await page.goto('/validations');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Accès refusé');

    await contexte.close();
  });

  test('un responsable accède à l\'écran de validation', async ({ browser }) => {
    const { contexte, page } = await contexteConnecte(browser, 'responsable@demo.test');

    await page.goto('/validations');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Demandes à valider');

    await contexte.close();
  });
});

test.describe('Circuit de validation', () => {

  /** Deux contextes indépendants : deux sessions complètes dans le même test. */
  test('validation à quatre yeux entre deux utilisateurs', async ({ browser }) => {
    const a = await contexteConnecte(browser, 'client@demo.test');
    const b = await contexteConnecte(browser, 'responsable@demo.test');

    // Le client compose une commande au-dessus du seuil : 4 x 289 = 1156 €.
    for (let i = 0; i < 4; i++) {
      await a.page.request.post('/api/panier', { data: { id: 3 } });
    }

    await a.page.goto('/panier');
    await expect(a.page.getByTestId('total-panier')).toHaveText('1156,00 €');
    await a.page.getByRole('button', { name: 'Commander' }).click();

    const nouvelle = a.page.getByTestId('commande-nouvelle');
    await expect(nouvelle).toBeVisible();
    const reference = (await nouvelle.locator('td').first().textContent())!.trim();
    await expect(nouvelle).toContainText('En attente de validation');

    // Le responsable voit la demande et la valide.
    await b.page.goto('/validations');
    await b.page.getByRole('row', { name: new RegExp(reference) })
      .getByRole('button', { name: 'Valider' })
      .click();

    // Le client constate le changement d'état.
    await a.page.reload();
    await expect(a.page.getByRole('row', { name: new RegExp(reference) }))
      .toContainText('Validée');

    await a.contexte.close();
    await b.contexte.close();
  });
});

test.describe('Export de documents', () => {

  test('l\'export CSV est téléchargeable et bien formé', async ({ browser }) => {
    const { contexte, page } = await contexteConnecte(browser, 'client@demo.test');

    // Une commande au moins, pour que l'export ne soit pas vide.
    await page.request.post('/api/panier', { data: { id: 2 } });
    const cmd = await page.request.post('/api/commandes', { data: {} });
    expect(cmd.status()).toBe(201);

    await page.goto('/commandes');

    const [fichier] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('link', { name: 'Exporter en CSV' }).click(),
    ]);

    expect(fichier.suggestedFilename()).toBe('commandes.csv');

    const chemin = await fichier.path();
    const contenu = await fs.promises.readFile(chemin, 'utf8');
    const lignes = contenu.trim().split('\n');

    // 1. l'en-tête
    expect(lignes[0]).toBe('reference;client;montant;statut');
    // 2. au moins une ligne de données
    expect(lignes.length).toBeGreaterThan(1);
    // 3. le contenu, pas seulement la taille du fichier
    expect(contenu).toContain('Marie DUPONT');
    // 4. l'encodage : c'est ce que la vérification de taille ne voit jamais.
    //    Relancez avec « node lancer.js csv-casse » : ce test devient rouge.
    expect(contenu).toMatch(/Validée|En attente de validation/);
    expect(contenu).not.toContain('�');

    await contexte.close();
  });
});
