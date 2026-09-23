import { test, expect } from '@playwright/test';

/* ═══════════════════════════════════════════════════════════════════════════
   NIVEAU 1  ·  PREMIERS PAS                                    Module 1
   ═══════════════════════════════════════════════════════════════════════════

   Objectif : écrire vos premiers tests, du plus simple au parcours complet.

   MODE D'EMPLOI
   Chaque exercice est un test désactivé. Retirez le « .skip » pour l'activer,
   écrivez le code, relancez. Travaillez de préférence avec :

       node lancer.js exercices --ui

   Le mode UI relance automatiquement à chaque sauvegarde et montre le DOM
   à chaque étape.

   RAPPEL DES DONNÉES DE L'APPLICATION
   8 produits. Clavier mécanique 49,00 €, Souris ergonomique 29,00 €,
   Écran 27 pouces 289,00 € (4 en stock), Casque antibruit 159,00 €
   (rupture de stock), Station d'accueil 189,00 €, Webcam HD 79,00 €,
   Support d'écran 39,00 €, Tapis de souris XL 19,00 €.
   ═══════════════════════════════════════════════════════════════════════════ */


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 1  ·  ★☆☆☆☆  ·  La page d'accueil
   ───────────────────────────────────────────────────────────────────────────
   Vérifiez que la page d'accueil :
     a) a un titre qui contient « Boutique interne »
     b) affiche un titre de niveau 1 valant exactement « Nos produits »

   Indices
     · await page.goto('/')          la baseURL est déjà configurée
     · await expect(page).toHaveTitle(/.../)
     · page.getByRole('heading', { level: 1 })
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e1 · la page d\'accueil affiche le bon titre', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 2  ·  ★☆☆☆☆  ·  Compter et lire
   ───────────────────────────────────────────────────────────────────────────
   Vérifiez que :
     a) le catalogue contient 8 produits
     b) le prix affiché du Clavier mécanique est « 49,00 € »

   Indices
     · un produit est un <li> : page.getByRole('listitem')
     · toHaveCount(n) réessaie tant que le compte n'est pas atteint,
       ce qui est utile ici : le catalogue est chargé par le navigateur
     · chaque prix porte un identifiant de test : data-testid="prix-1"
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e2 · le catalogue affiche 8 produits et leurs prix', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 3  ·  ★★☆☆☆  ·  La recherche
   ───────────────────────────────────────────────────────────────────────────
   a) Recherchez « écran ». Deux produits doivent rester : « Écran 27 pouces »
      et « Support d'écran ».
   b) Recherchez « imprimante ». Aucun produit, et le message
      « Aucun produit ne correspond » doit apparaître.

   Écrivez DEUX tests séparés : un cas passant, un cas vide.

   Indices
     · le champ porte un label : page.getByLabel('Rechercher un produit')
     · .fill('écran') puis clic sur le bouton « Rechercher »
     · getByText() pour le message
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e3a · la recherche filtre le catalogue', async ({ page }) => {
  // TODO
});

test.skip('e3b · une recherche sans résultat affiche un message', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 4  ·  ★★☆☆☆  ·  Naviguer vers une fiche produit
   ───────────────────────────────────────────────────────────────────────────
   Depuis le catalogue, cliquez sur le lien « Écran 27 pouces ».
   Sur la fiche, vérifiez le titre de niveau 1, le prix (289,00 €)
   et le stock (« 4 en stock »).

   Contrainte : partez de la page d'accueil et NAVIGUEZ par un clic.
   N'allez pas directement sur /produit?id=3.

   Indices
     · page.getByRole('link', { name: 'Écran 27 pouces' })
     · data-testid="prix" et data-testid="stock" sur la fiche
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e4 · la fiche produit affiche prix et stock', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 5  ·  ★★☆☆☆  ·  Ajouter au panier
   ───────────────────────────────────────────────────────────────────────────
   Ajoutez le Clavier mécanique au panier depuis le catalogue, puis vérifiez :
     a) le badge du panier affiche « 1 »
     b) le message de confirmation « Article ajouté au panier » est visible

   ATTENTION : l'application met 350 ms à rafraîchir le badge.
   N'ajoutez AUCUNE attente. Une assertion web-first suffit.

   Indices
     · il y a 7 boutons « Ajouter au panier » : commencez par restreindre
       au bon produit avec getByRole('listitem').filter({ hasText: ... })
     · data-testid="badge-panier" et data-testid="confirmation"
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e5 · ajouter un article met le badge à jour', async ({ page }) => {
  // TODO
});
