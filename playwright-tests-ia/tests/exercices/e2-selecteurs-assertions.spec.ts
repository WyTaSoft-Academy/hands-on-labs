import { test, expect } from '@playwright/test';

/* ═══════════════════════════════════════════════════════════════════════════
   NIVEAU 2  ·  SÉLECTEURS ET ASSERTIONS                          Module 2
   ═══════════════════════════════════════════════════════════════════════════

   Objectif : écrire des tests qui survivent aux évolutions de l'interface.

   À SAVOIR AVANT DE COMMENCER
   L'application génère une classe CSS différente à CHAQUE démarrage
   (regardez la console du serveur). Tout sélecteur accroché à cette classe
   casse au redémarrage suivant. C'est volontaire.
   ═══════════════════════════════════════════════════════════════════════════ */


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 6  ·  ★★☆☆☆  ·  Réparer des sélecteurs fragiles
   ───────────────────────────────────────────────────────────────────────────
   Voici un test qui « marche » aujourd'hui et cassera demain :

       await page.goto('/');
       await page.locator('ul.produits li:nth-child(2) .css-a1b2c3').click();
       await page.locator('.badge').waitFor();
       expect(await page.locator('.badge').textContent()).toBe('1');

   Réécrivez-le entièrement. Il doit :
     · ajouter la Souris ergonomique au panier
     · vérifier que le badge affiche « 1 »

   Contraintes
     · aucun sélecteur CSS, aucun XPath
     · aucune lecture de valeur avec textContent()
     · aucune attente explicite

   Pour chacun des trois défauts du test d'origine, écrivez en commentaire
   ce qui le casserait dans la vraie vie.
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e6 · réécrire un test aux sélecteurs fragiles', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 7  ·  ★★★☆☆  ·  Le mode strict
   ───────────────────────────────────────────────────────────────────────────
   a) Vérifiez que page.getByRole('button', { name: 'Ajouter au panier' })
      correspond à 7 éléments (8 produits, dont 1 en rupture).
   b) Montrez que cliquer sur ce locator ambigu échoue, en attrapant l'erreur.
      Utilisez un timeout court pour ne pas attendre 30 secondes.
   c) Ciblez ensuite précisément le bouton de la Webcam HD, de DEUX façons
      différentes, et vérifiez que chacune correspond à exactement 1 élément.

   Indices
     · await expect(promesse).rejects.toThrow(/strict mode violation/)
     · .click({ timeout: 2000 })
     · pistes pour cibler : filter({ hasText }), getByTestId('ajouter-6'),
       .nth(), .and()
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e7 · lever une ambiguïté de locator', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 8  ·  ★★☆☆☆  ·  Un produit indisponible
   ───────────────────────────────────────────────────────────────────────────
   Le Casque antibruit est en rupture de stock. Vérifiez que :
     a) son bouton porte le libellé « Indisponible »
     b) ce bouton est désactivé
     c) sur sa fiche produit, le texte « Rupture de stock » est affiché

   Indices
     · toBeDisabled()
     · la fiche est accessible par un clic sur le nom du produit
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e8 · un produit en rupture n\'est pas commandable', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 9  ·  ★★★☆☆  ·  Le panier
   ───────────────────────────────────────────────────────────────────────────
   Ajoutez le Clavier mécanique (49 €) et la Souris ergonomique (29 €),
   puis, sur la page du panier, vérifiez :
     a) le total affiché : « 78,00 € »
     b) le tableau contient 2 lignes de produits
     c) la ligne du clavier contient bien « Clavier mécanique »

   Attention au comptage des lignes : le tableau a un en-tête.

   Indices
     · data-testid="total-panier"
     · page.getByRole('row') compte AUSSI la ligne d'en-tête
     · page.getByRole('row', { name: /Clavier/ }) pour viser une ligne
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e9 · le panier affiche les lignes et le total', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 10  ·  ★★★☆☆  ·  Le piège de la lecture manuelle
   ───────────────────────────────────────────────────────────────────────────
   Écrivez DEUX tests sur le même scénario : ajouter un article et vérifier
   que le badge passe à « 1 ».

   a) Le premier lit la valeur à la main avec textContent() et la compare.
      Il DOIT échouer, à cause des 350 ms de délai. Marquez-le avec
      test.fail() pour que la suite reste verte tout en documentant l'échec.

   b) Le second utilise une assertion web-first. Il doit passer.

   Puis répondez en commentaire : pourquoi le premier échoue-t-il alors que
   le second passe, sur exactement le même scénario ?

   Indices
     · test.fail('titre', async ({ page }) => { ... })
     · attention : test.fail n'absorbe qu'un échec d'assertion,
       pas un dépassement de délai. Ici c'est bien une assertion qui échoue.
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e10a · lire la valeur à la main échoue', async ({ page }) => {
  // TODO
});

test.skip('e10b · l\'assertion web-first attend la mise à jour', async ({ page }) => {
  // TODO
});
