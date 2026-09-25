import { test, expect } from '../fixtures/test-base';

/**
 * MODULE 4 : préparer par API, vérifier par API.
 * Annexe : tests d'API sans navigateur.
 *
 * On utilise « page.request » et non la fixture « request » : page.request
 * partage les cookies du contexte, donc la session ouverte par la fixture
 * « connecte ». La fixture « request » a son propre bocal à cookies.
 */

test('l\'API refuse une commande vide', async ({ page }) => {
  await page.request.delete('/api/panier');

  const r = await page.request.post('/api/commandes', { data: {} });

  expect(r.status()).toBe(422);
  expect((await r.json()).erreur).toBe('Commande vide');
});

test('l\'API refuse un produit en rupture', async ({ page }) => {
  const r = await page.request.post('/api/panier', { data: { id: 4 } });

  expect(r.status()).toBe(409);
  expect((await r.json()).erreur).toBe('Produit indisponible');
});

test('un produit inconnu renvoie 404', async ({ page }) => {
  const r = await page.request.post('/api/panier', { data: { id: 9999 } });
  expect(r.status()).toBe(404);
});

/** Préparation par API, vérification par l'interface : le parcours est bien plus court. */
test('le panier préparé par API s\'affiche à l\'écran', async ({ page }) => {
  await page.request.post('/api/panier', { data: { id: 3 } });
  await page.request.post('/api/panier', { data: { id: 3 } });

  await page.goto('/panier');
  await expect(page.getByTestId('total-panier')).toHaveText('578,00 €');
});

/** L'écran dit « commande passée ». L'API confirme qu'elle est bien enregistrée. */
test('la commande passée à l\'écran existe côté serveur', async ({ page }) => {
  await page.request.post('/api/panier', { data: { id: 1 } });

  await page.goto('/panier');
  await page.getByRole('button', { name: 'Commander' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vos commandes');

  // On vise la commande que CE test vient de creer, pas la premiere ligne du
  // tableau : la liste est partagee entre tous les tests du meme utilisateur.
  const ligne = page.getByTestId('commande-nouvelle');
  await expect(ligne).toBeVisible();
  const reference = (await ligne.locator('td').first().textContent())!.trim();

  const r = await page.request.get(`/api/commandes?reference=${reference}`);

  expect(r.status()).toBe(200);
  expect((await r.json()).montant).toBe(49);
});

/** Annexe sécurité : les en-têtes ne doivent pas disparaître au fil des refontes. */
test('les en-têtes de sécurité sont posés', async ({ page }) => {
  const r = await page.goto('/');
  const h = r!.headers();

  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['content-security-policy']).toBeTruthy();
  expect(h['strict-transport-security']).toBeTruthy();
  expect(h['x-powered-by']).toBeUndefined();
});
