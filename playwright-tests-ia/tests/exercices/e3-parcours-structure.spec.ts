import { test, expect } from '@playwright/test';

/* ═══════════════════════════════════════════════════════════════════════════
   NIVEAU 3  ·  PARCOURS ET STRUCTURE                             Module 3
   ═══════════════════════════════════════════════════════════════════════════

   Objectif : des parcours complets, et du code de test que l'on peut relire
   dans six mois.

   COMPTES DE DÉMONSTRATION
   client@demo.test        rôle client
   responsable@demo.test   rôle responsable
   mot de passe : demo
   ═══════════════════════════════════════════════════════════════════════════ */


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 11  ·  ★★★☆☆  ·  Un parcours complet
   ───────────────────────────────────────────────────────────────────────────
   Enchaînez, dans un seul test :
     1. ajouter l'Écran 27 pouces (289 €)
     2. ajouter le Tapis de souris XL (19 €)
     3. aller au panier, vérifier le total : 308,00 €
     4. retirer le Tapis de souris XL
     5. vérifier le nouveau total : 289,00 €
     6. vérifier qu'il ne reste qu'une ligne de produit

   Indices
     · le bouton « Retirer » est dans la ligne du produit :
       page.getByRole('row', { name: /Tapis/ }).getByRole('button', ...)
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e11 · ajouter puis retirer met le total à jour', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 12  ·  ★★★☆☆  ·  Connexion, les deux cas
   ───────────────────────────────────────────────────────────────────────────
   Écrivez DEUX tests :

   a) Connexion réussie avec client@demo.test / demo.
      Vérifiez que le nom « Marie DUPONT » apparaît dans l'entête,
      et que le lien « Se déconnecter » est visible.

   b) Connexion refusée avec un mauvais mot de passe.
      Vérifiez que le message « Identifiants incorrects » apparaît
      dans un élément de rôle « alert ».

   Le cas qui échoue compte autant que celui qui réussit : c'est souvent
   celui que l'on oublie d'automatiser.

   Indices
     · getByLabel('Adresse email'), getByLabel('Mot de passe')
     · data-testid="utilisateur"
     · page.getByRole('alert')
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e12a · la connexion affiche le nom de l\'utilisateur', async ({ page }) => {
  // TODO
});

test.skip('e12b · la connexion refuse un mot de passe incorrect', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 13  ·  ★★★★☆  ·  Écrire un Page Object
   ───────────────────────────────────────────────────────────────────────────
   Créez une classe ConnexionPage, DANS CE FICHIER pour commencer, avec :
     · aller()                          va sur /connexion
     · seConnecter(email, motDePasse)   remplit et soumet le formulaire
     · une propriété « erreur » qui expose le locator du message d'alerte

   Puis réécrivez les deux tests de l'exercice 12 en l'utilisant.

   RÈGLE À RESPECTER
   Le Page Object décrit COMMENT interagir. Il ne contient AUCUNE assertion
   métier : c'est le test qui décide de ce qui doit être vrai.

   Pour aller plus loin : déplacez la classe dans un fichier séparé
   et importez-la.
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e13a · connexion réussie, via le Page Object', async ({ page }) => {
  // TODO
});

test.skip('e13b · connexion refusée, via le Page Object', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 14  ·  ★★★☆☆  ·  Un test par jeu de données
   ───────────────────────────────────────────────────────────────────────────
   Vérifiez le prix affiché sur la fiche de quatre produits :

       id 1  Clavier mécanique     49,00 €
       id 2  Souris ergonomique    29,00 €
       id 7  Support d'écran       39,00 €
       id 8  Tapis de souris XL    19,00 €

   Contrainte : n'écrivez pas quatre tests copiés-collés, et n'écrivez pas
   non plus un seul test qui boucle. Générez QUATRE tests depuis un tableau
   de données.

   Pourquoi ? Chaque cas doit apparaître séparément dans le rapport, pouvoir
   échouer sans empêcher les autres, et pouvoir être relancé seul.

   Indices
     · for (const cas of CAS) { test(`...${cas.nom}...`, async ({ page }) => ...) }
     · le titre de chaque test doit être unique
   ─────────────────────────────────────────────────────────────────────────── */
const PRODUITS = [
  { id: 1, nom: 'Clavier mécanique', prix: '49,00 €' },
  { id: 2, nom: 'Souris ergonomique', prix: '29,00 €' },
  { id: 7, nom: 'Support d\'écran', prix: '39,00 €' },
  { id: 8, nom: 'Tapis de souris XL', prix: '19,00 €' },
];

// TODO exercice 14 : générez ici un test par entrée de PRODUITS.


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 15  ·  ★★★★☆  ·  Découper un parcours long
   ───────────────────────────────────────────────────────────────────────────
   Écrivez le parcours de commande complet, découpé en étapes nommées :

     étape « se connecter »     client@demo.test / demo
     étape « composer le panier »  Webcam HD (79 €) + Support d'écran (39 €)
     étape « vérifier le panier »  total 118,00 €
     étape « commander »        et vérifier l'arrivée sur « Vos commandes »

   Utilisez test.step. Lancez ensuite avec --ui ou ouvrez la trace :
   les étapes apparaissent nommées et repliables.

   Indices
     · await test.step('nom de l\'étape', async () => { ... });
     · après la commande, la ligne créée porte data-testid="commande-nouvelle"
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e15 · commande complète, étape par étape', async ({ page }) => {
  // TODO
});
