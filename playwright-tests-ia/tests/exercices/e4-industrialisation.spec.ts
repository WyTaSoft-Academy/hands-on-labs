import { test as base, expect } from '@playwright/test';

/* ═══════════════════════════════════════════════════════════════════════════
   NIVEAU 4  ·  INDUSTRIALISATION                                 Module 4
   ═══════════════════════════════════════════════════════════════════════════

   Objectif : ne plus dépendre du serveur pour tester, préparer l'état par API,
   factoriser avec des fixtures, contrôler un document produit.

   À SAVOIR
   Le catalogue de la page d'accueil est chargé PAR LE NAVIGATEUR depuis
   /api/produits. Intercepter cet appel change donc réellement l'affichage.

   Points d'API disponibles :
     GET    /api/produits[?q=]
     POST   /api/panier        { id }
     GET    /api/panier
     DELETE /api/panier
     POST   /api/connexion     { email, mdp }
     POST   /api/commandes
     GET    /api/commandes[?reference=]
     GET    /api/export.csv
   ═══════════════════════════════════════════════════════════════════════════ */

const test = base;


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 16  ·  ★★★☆☆  ·  Simuler un catalogue vide
   ───────────────────────────────────────────────────────────────────────────
   Interceptez /api/produits et renvoyez une liste vide.
   Vérifiez ensuite que la page affiche « Aucun produit ne correspond »
   et qu'aucun produit n'est listé.

   Ce cas est presque impossible à provoquer autrement : il faudrait vider
   le catalogue de l'application.

   Indices
     · le motif de route s'écrit avec des jokers : deux étoiles, une barre
       oblique, puis « api/produits » suivi d'une étoile
     · await page.route(motif, route => route.fulfill({ ... }))
     · body: JSON.stringify([])
     · la route doit être posée AVANT le page.goto()
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e16 · catalogue vide, le message adapté s\'affiche', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 17  ·  ★★★☆☆  ·  Simuler une panne
   ───────────────────────────────────────────────────────────────────────────
   Écrivez DEUX tests :
     a) l'API renvoie une erreur 500
     b) la requête échoue complètement (route.abort())

   Dans les deux cas, vérifiez que la page affiche le message
   « Le catalogue est momentanément indisponible. » dans un rôle « alert »,
   ET que l'entête reste utilisable (le lien vers le Panier est visible).

   Ce second point est le vrai sujet : une panne de service secondaire ne doit
   pas rendre la page inutilisable.

   Indices
     · route.fulfill({ status: 500, body: '...' })
     · route.abort()
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e17a · erreur serveur, la page reste utilisable', async ({ page }) => {
  // TODO
});

test.skip('e17b · panne réseau, la page reste utilisable', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 18  ·  ★★★☆☆  ·  Préparer par API, vérifier à l'écran
   ───────────────────────────────────────────────────────────────────────────
   Sans jamais cliquer sur « Ajouter au panier » :
     1. ajoutez deux fois l'Écran 27 pouces (id 3) par API
     2. allez sur /panier
     3. vérifiez que le total affiché est « 578,00 € »

   Puis mesurez : combien de temps prend ce test, comparé à l'exercice 11
   qui fait la même préparation par l'interface ?

   Indices
     · utilisez page.request, PAS la fixture « request » :
       page.request partage les cookies de la page, donc la même session
     · await page.request.post('/api/panier', { data: { id: 3 } })
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e18 · le panier préparé par API s\'affiche à l\'écran', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 19  ·  ★★★★☆  ·  Écrire une fixture
   ───────────────────────────────────────────────────────────────────────────
   Créez une fixture « connecte » qui, avant chaque test qui la demande :
     · ouvre une session par API avec client@demo.test / demo
     · vide le panier
     · et, après le test, vide à nouveau le panier

   Utilisez-la ensuite dans un test qui vérifie que la page /commandes est
   accessible et affiche le titre « Vos commandes ».

   POURQUOI PAS UN storageState ?
   Cette application garde le panier en session serveur. Partager un
   storageState entre tests reviendrait à partager le panier, et deux tests
   parallèles se marcheraient dessus. C'est le défaut « état partagé »
   du module 3. Une session par test l'évite.

   Indices
     · const test = base.extend<{ connecte: void }>({ connecte: async ({ page }, use) => { ... } })
     · le code avant « await use() » s'exécute avant le test,
       celui après s'exécute après, même si le test échoue
   ─────────────────────────────────────────────────────────────────────────── */
// TODO exercice 19 : définissez ici votre fixture, puis le test qui l'utilise.


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 20  ·  ★★★★☆  ·  Contrôler un document produit
   ───────────────────────────────────────────────────────────────────────────
   1. Connectez-vous, ajoutez un article et passez commande (par API,
      c'est plus rapide).
   2. Allez sur /commandes et téléchargez l'export CSV.
   3. Vérifiez QUATRE choses :
        a) le nom du fichier proposé est « commandes.csv »
        b) la première ligne vaut « reference;client;montant;statut »
        c) le contenu contient « Marie DUPONT »
        d) les accents sortent correctement : le contenu ne contient
           pas le caractère de remplacement « � »

   Le point (d) est le vrai sujet de l'exercice. Un export qui perd ses accents
   reste un fichier valide, de la bonne taille : seule une vérification du
   contenu le détecte.

   POUR VÉRIFIER QUE VOTRE TEST SERT À QUELQUE CHOSE
   Relancez avec l'encodage cassé :  node lancer.js csv-casse
   Votre test doit devenir rouge. S'il reste vert, il ne vérifie rien.

   Indices
     · const [fichier] = await Promise.all([
         page.waitForEvent('download'),
         page.getByRole('link', { name: 'Exporter en CSV' }).click(),
       ]);
     · await fichier.path() puis fs.promises.readFile(chemin, 'utf8')
     · import * as fs from 'fs';
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e20 · l\'export CSV est bien formé et bien encodé', async ({ page }) => {
  // TODO
});
