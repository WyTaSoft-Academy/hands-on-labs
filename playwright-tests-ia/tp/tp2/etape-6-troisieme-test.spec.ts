import { test, expect } from '@playwright/test';

/**
 * TP 2 · ETAPE 6 — le troisieme test, genere a partir d'un prompt complet.
 *
 * L'enonce : « rediger un prompt complet (contexte, DOM, scenario,
 * contraintes) pour generer un troisieme test ». Le scenario est nouveau :
 * RETIRER un produit du panier. Rien a recopier des etapes precedentes.
 *
 * LE PROMPT, a construire en direct un bloc a la fois. Le bloc DOM ne se tape
 * pas : il se RELEVE sur la vraie page, soit F12 > Copy outerHTML, soit
 * « Assert snapshot » dans le Codegen, qui donne l'arbre d'accessibilite,
 * exactement ce que lisent les getByRole.
 *
 *   Contexte : application web « Boutique interne » servie sur
 *     http://localhost:3000 (baseURL configuree). Playwright 1.63,
 *     TypeScript, @playwright/test. Chaque test demarre avec un panier vide.
 *   DOM :
 *     - "/" : un <li> par produit, avec un <h3> (nom) et un <button>
 *       « Ajouter au panier ». Clavier mecanique 49,00 € ; Souris
 *       ergonomique 29,00 €.
 *     - En-tete : lien « Panier » contenant data-testid="badge-panier"
 *       (nombre d'articles, mis a jour apres ~350 ms).
 *     - "/panier" : <table>, une ligne par article (nom | quantite |
 *       montant | bouton « Retirer »). Total : data-testid="total-panier",
 *       format « 78,00 € ». Retirer recharge la page.
 *   Scenario : ajouter le clavier et la souris, ouvrir le panier, retirer la
 *     souris, verifier que seul le clavier reste, que le total vaut 49,00 €
 *     et que le badge affiche 1.
 *   Contraintes : locators par role ou label, getByTestId seulement pour le
 *     badge et le total ; cibler la ligne par son contenu, jamais par
 *     position ; aucune attente fixe ; assertions sur des VALEURS ; un seul
 *     test nomme selon le comportement, avec test.step par phase.
 *
 * LA RELECTURE, meme si le test est vert :
 *   - les valeurs attendues se recalculent a la main : 78 € - 29 € = 49 €
 *   - LE PIEGE DE CE SCENARIO : le tableau a une ligne d'en-tete. Apres le
 *     retrait il reste DEUX « row », pas une. Une IA qui ecrit
 *     toHaveCount(1) produit un test rouge, et le reflexe de « corriger » en
 *     passant a 2 sans comprendre pourquoi est exactement celui a eviter.
 *   - le badge a 2 AVANT d'ouvrir le panier n'est pas decoratif : l'ajout
 *     part en arriere-plan, et quitter la page trop tot perd le second
 *     article. C'est l'assertion qui sert d'attente.
 *
 * LA PREUVE : commenter le clic sur « Retirer ». Le test devient rouge sur
 * le nombre de lignes (3), le total (78,00 €) et le badge (2). La presence du
 * clavier reste verte, et c'est normal : elle ne distingue pas un panier
 * reussi d'un panier rate. Seule, elle n'aurait rien prouve.
 */

test('retirer un produit met a jour le panier, le total et le badge', async ({ page }) => {
  await test.step('ajouter le clavier et la souris', async () => {
    await page.goto('/');
    for (const produit of ['Clavier mécanique', 'Souris ergonomique']) {
      await page.getByRole('listitem')
        .filter({ hasText: produit })
        .getByRole('button', { name: 'Ajouter au panier' })
        .click();
    }
    await expect(page.getByTestId('badge-panier')).toHaveText('2');
  });

  await test.step('retirer la souris depuis le panier', async () => {
    await page.getByRole('link', { name: /Panier/ }).click();
    await page.getByRole('row')
      .filter({ hasText: 'Souris ergonomique' })
      .getByRole('button', { name: 'Retirer' })
      .click();
  });

  await test.step('seul le clavier reste, au bon total', async () => {
    const lignes = page.getByRole('row');
    // L'en-tete compte : une ligne d'en-tete + le clavier.
    await expect(lignes).toHaveCount(2);
    await expect(lignes.filter({ hasText: 'Clavier mécanique' })).toBeVisible();
    await expect(page.getByTestId('total-panier')).toHaveText('49,00 €');
    await expect(page.getByTestId('badge-panier')).toHaveText('1');
  });
});
