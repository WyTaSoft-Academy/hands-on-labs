import { test, expect, Browser } from '@playwright/test';

/* NIVEAU 5 · corrigé. */

/** Ouvre un contexte neuf, déjà authentifié, sans passer par le formulaire. */
async function contexteConnecte(browser: Browser, email: string) {
  const contexte = await browser.newContext({ baseURL: 'http://localhost:3000' });
  const page = await contexte.newPage();
  const r = await page.request.post('/api/connexion', { data: { email, mdp: 'demo' } });
  expect(r.ok()).toBeTruthy();
  return { contexte, page };
}

test('e21 · validation à quatre yeux entre deux utilisateurs', async ({ browser }) => {
  const a = await contexteConnecte(browser, 'client@demo.test');
  const b = await contexteConnecte(browser, 'responsable@demo.test');

  // 4 x 289 = 1156 €, donc au-dessus du seuil de 1000 €.
  for (let i = 0; i < 4; i++) {
    await a.page.request.post('/api/panier', { data: { id: 3 } });
  }

  await a.page.goto('/panier');
  await expect(a.page.getByTestId('total-panier')).toHaveText('1156,00 €');
  await a.page.getByRole('button', { name: 'Commander' }).click();

  // On identifie la commande créée par CE test : la liste est partagée
  // entre tous les tests du même utilisateur.
  const nouvelle = a.page.getByTestId('commande-nouvelle');
  await expect(nouvelle).toContainText('En attente de validation');
  const reference = (await nouvelle.locator('td').first().textContent())!.trim();

  await b.page.goto('/validations');
  await b.page.getByRole('row', { name: new RegExp(reference) })
    .getByRole('button', { name: 'Valider' })
    .click();

  await a.page.reload();
  await expect(a.page.getByRole('row', { name: new RegExp(reference) }))
    .toContainText('Validée');

  await a.contexte.close();
  await b.contexte.close();
});

test('e22a · un client ne peut pas valider', async ({ browser }) => {
  const { contexte, page } = await contexteConnecte(browser, 'client@demo.test');

  await page.goto('/validations');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Accès refusé');

  await contexte.close();
});

test('e22b · un responsable accède aux validations', async ({ browser }) => {
  const { contexte, page } = await contexteConnecte(browser, 'responsable@demo.test');

  await page.goto('/validations');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Demandes à valider');

  await contexte.close();
});

test('e22c · un visiteur non connecté est renvoyé vers la connexion', async ({ page }) => {
  // La fixture « page » part toujours d'un contexte vierge : aucune session.
  await page.goto('/validations');

  await expect(page).toHaveURL(/\/connexion/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Connexion');
});

/**
 * Exercice 23. Les deux approches passent avec ou sans le bandeau actif.
 * Préférence : (b). Le gestionnaire traite le symptôme et reste du code à
 * maintenir ; poser le cookie supprime la cause, et le test n'a plus rien à
 * contourner. On garde (a) quand on ne peut pas agir sur l'application.
 */
test('e23a · un gestionnaire ferme le bandeau automatiquement', async ({ page }) => {
  await page.addLocatorHandler(
    page.getByRole('dialog', { name: 'Cookies' }),
    async (dialogue) => {
      await dialogue.getByRole('button', { name: 'Accepter' }).click();
    },
  );

  await page.goto('/');
  for (const id of [1, 2, 5]) {
    await page.getByTestId(`ajouter-${id}`).click();
  }

  await expect(page.getByTestId('badge-panier')).toHaveText('3');
});

test('e23b · supprimer la cause plutôt que la contourner', async ({ browser }) => {
  const contexte = await browser.newContext({ baseURL: 'http://localhost:3000' });
  await contexte.addCookies([
    { name: 'consent', value: '1', domain: 'localhost', path: '/' },
  ]);
  const page = await contexte.newPage();

  await page.goto('/');
  // Le bandeau n'est même pas rendu : rien à intercepter.
  await expect(page.getByRole('dialog', { name: 'Cookies' })).toHaveCount(0);

  for (const id of [1, 2, 5]) {
    await page.getByTestId(`ajouter-${id}`).click();
  }
  await expect(page.getByTestId('badge-panier')).toHaveText('3');

  await contexte.close();
});

test('e24 · les en-têtes de sécurité sont posés', async ({ page }) => {
  const reponse = await page.goto('/');
  const entetes = reponse!.headers();

  expect(entetes['x-content-type-options']).toBe('nosniff');
  expect(entetes['content-security-policy']).toBeTruthy();
  expect(entetes['strict-transport-security']).toBeTruthy();
  expect(entetes['x-powered-by']).toBeUndefined();

  const html = await page.content();
  expect(html).not.toMatch(/sk_live_|BEGIN PRIVATE KEY/);
});

/* ── Exercice 25 · trois pistes parmi celles proposées ─────────────────── */

test('e25a · commander avec un panier vide est refusé', async ({ page }) => {
  await page.request.post('/api/connexion', {
    data: { email: 'client@demo.test', mdp: 'demo' },
  });
  await page.request.delete('/api/panier');

  const r = await page.request.post('/api/commandes', { data: {} });

  expect(r.status()).toBe(422);
  expect((await r.json()).erreur).toBe('Commande vide');
});

test('e25b · le panier survit à la navigation entre pages', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('ajouter-1').click();
  await expect(page.getByTestId('badge-panier')).toHaveText('1');

  await page.getByRole('link', { name: 'Commandes' }).click();
  await expect(page.getByTestId('badge-panier')).toHaveText('1');

  await page.getByRole('link', { name: 'Catalogue' }).click();
  await expect(page.getByTestId('badge-panier')).toHaveText('1');
});

test('e25c · ajouter deux fois le même article cumule la quantité', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('ajouter-1').click();
  await expect(page.getByTestId('badge-panier')).toHaveText('1');
  await page.getByTestId('ajouter-1').click();
  await expect(page.getByTestId('badge-panier')).toHaveText('2');

  await page.goto('/panier');
  // Une seule ligne, mais une quantité de 2 et un total doublé.
  await expect(page.getByRole('row')).toHaveCount(2);       // en-tête + 1 ligne
  await expect(page.getByTestId('total-panier')).toHaveText('98,00 €');
});
