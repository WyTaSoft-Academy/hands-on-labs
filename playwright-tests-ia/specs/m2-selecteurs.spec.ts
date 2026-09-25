import { test, expect } from '@playwright/test';

/**
 * MODULE 2 : sélecteurs robustes, mode strict, auto-wait.
 *
 * DÉMONSTRATION EN DIRECT
 * L'application génère une classe CSS différente à chaque démarrage
 * (voir la console du serveur : « classe CSS générée ce démarrage »).
 * Le premier test ci-dessous s'accroche à une classe figée : il montre
 * ce que verrait un vrai test au prochain déploiement.
 */

test.describe('Cibler le bon élément', () => {

  /**
   * Ce que l'on ne veut pas : un sélecteur accroché au style.
   * La classe est régénérée à chaque démarrage du serveur, donc celle qui est
   * figée ici ne correspond plus à rien, alors que le bouton est bien présent.
   */
  test('sélecteur CSS fragile : ne trouve plus rien après un redémarrage', async ({ page }) => {
    await page.goto('/');

    // La classe figée ne correspond à aucun élément.
    await expect(page.locator('.css-a1b2c3')).toHaveCount(0);

    // Le clic échoue donc, avec un délai raccourci pour la démonstration.
    await expect(page.locator('.css-a1b2c3').click({ timeout: 2000 }))
      .rejects.toThrow(/Timeout/);

    // Le même bouton, ciblé par son rôle, est là et fonctionne.
    await expect(page.getByRole('button', { name: 'Ajouter au panier' }).first())
      .toBeVisible();
  });

  /** Ce que l'on veut : un sélecteur accroché au sens. */
  test('sélecteur par rôle : insensible au style', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('listitem')
      .filter({ hasText: 'Souris ergonomique' })
      .getByRole('button', { name: 'Ajouter au panier' })
      .click();

    await expect(page.getByTestId('badge-panier')).toHaveText('1');
  });

  /** Le mode strict refuse de choisir à votre place. */
  test('mode strict : un locator ambigu lève une erreur explicite', async ({ page }) => {
    await page.goto('/');

    const ambigu = page.getByRole('button', { name: 'Ajouter au panier' });
    await expect(ambigu).toHaveCount(7);   // 8 produits, 1 en rupture

    await expect(ambigu.click()).rejects.toThrow(/strict mode violation/);
  });

  /** Les quatre façons de lever l'ambiguïté, sur le même écran. */
  test('lever l\'ambiguïté de quatre manières', async ({ page }) => {
    await page.goto('/');

    // 1. restreindre à un conteneur
    const parConteneur = page.getByRole('listitem')
      .filter({ hasText: 'Webcam HD' })
      .getByRole('button', { name: 'Ajouter au panier' });

    // 2. par identifiant de test
    const parTestId = page.getByTestId('ajouter-6');

    // 3. par position, en dernier recours
    const parPosition = page.getByRole('button', { name: 'Ajouter au panier' }).nth(5);

    // 4. en combinant deux critères
    const parCombinaison = page.getByRole('button', { name: 'Ajouter au panier' })
      .and(page.getByTestId('ajouter-6'));

    for (const loc of [parConteneur, parTestId, parPosition, parCombinaison]) {
      await expect(loc).toHaveCount(1);
    }
  });
});

test.describe('Auto-wait et assertions', () => {

  /** L'application met 350 ms à rafraîchir le badge : rien à attendre à la main. */
  test('l\'assertion web-first attend la mise à jour différée', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('ajouter-1').click();

    await expect(page.getByTestId('badge-panier')).toHaveText('1');
    await expect(page.getByTestId('confirmation')).toHaveText('Article ajouté au panier');
  });

  /**
   * LE PIÈGE À MONTRER : lire la valeur soi-même ne réessaie pas.
   * Ce test échoue parce qu'il lit le badge avant la mise à jour.
   */
  test.fail('lire la valeur à la main échoue', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('ajouter-1').click();

    const texte = await page.getByTestId('badge-panier').textContent();
    expect(texte).toBe('1');   // vaut encore « 0 » à cet instant
  });

  /** Assertions souples : on voit tous les défauts d'un écran d'un coup. */
  test('assertions souples sur la fiche produit', async ({ page }) => {
    await page.goto('/produit?id=1');

    await expect.soft(page.getByRole('heading', { level: 1 })).toHaveText('Clavier mécanique');
    await expect.soft(page.getByTestId('prix')).toHaveText('49,00 €');
    await expect.soft(page.getByTestId('stock')).toHaveText('12 en stock');
  });
});
