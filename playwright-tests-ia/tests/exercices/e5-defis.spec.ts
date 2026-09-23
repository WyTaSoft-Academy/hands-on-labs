import { test, expect } from '@playwright/test';

/* ═══════════════════════════════════════════════════════════════════════════
   NIVEAU 5  ·  DÉFIS                                        Modules 3, 4
                                                             et annexes
   ═══════════════════════════════════════════════════════════════════════════

   Ces exercices n'ont pas de chemin balisé. Ils demandent de combiner ce que
   vous avez vu, et de décider vous-même de ce qui mérite d'être vérifié.

   RÈGLE MÉTIER À CONNAÎTRE
   Une commande dont le total dépasse 1000 € part en « En attente de validation »
   et doit être validée par un utilisateur de rôle responsable.
   ═══════════════════════════════════════════════════════════════════════════ */


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 21  ·  ★★★★★  ·  Deux utilisateurs en simultané
   ───────────────────────────────────────────────────────────────────────────
   Écrivez UN SEUL test qui fait intervenir deux utilisateurs :

     1. le client compose une commande au-dessus de 1000 €
        (quatre Écrans 27 pouces à 289 € font 1156 €)
     2. il commande, et voit sa commande « En attente de validation »
     3. le responsable ouvre /validations et valide cette commande
     4. le client recharge sa page et voit la commande « Validée »

   La difficulté : deux sessions indépendantes dans le même test.

   Indices
     · partez de la fixture « browser », pas de « page »
     · const contexte = await browser.newContext({ baseURL: 'http://localhost:3000' })
     · ouvrez une session dans chaque contexte via POST /api/connexion
     · la commande créée porte data-testid="commande-nouvelle" ;
       récupérez sa référence pour la retrouver côté responsable
     · fermez les deux contextes à la fin
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e21 · validation à quatre yeux entre deux utilisateurs', async ({ browser }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 22  ·  ★★★★☆  ·  Habilitations
   ───────────────────────────────────────────────────────────────────────────
   Écrivez TROIS tests :
     a) un client qui ouvre /validations obtient « Accès refusé »
     b) un responsable qui ouvre /validations obtient « Demandes à valider »
     c) un visiteur NON connecté qui ouvre /validations est redirigé
        vers la page de connexion

   Tester l'accès REFUSÉ compte autant que tester l'accès autorisé, et c'est
   presque toujours ce qu'on oublie.

   Indices
     · pour le cas (c), n'ouvrez aucune session : la fixture « page » part
       toujours d'un contexte vierge
     · vérifiez sur quoi vous atterrissez, pas seulement l'URL
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e22a · un client ne peut pas valider', async ({ browser }) => {
  // TODO
});

test.skip('e22b · un responsable accède aux validations', async ({ browser }) => {
  // TODO
});

test.skip('e22c · un visiteur non connecté est renvoyé vers la connexion', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 23  ·  ★★★★★  ·  Le bandeau qui surgit
   ───────────────────────────────────────────────────────────────────────────
   L'application peut afficher un bandeau de consentement BLOQUANT, à un
   instant non déterministe entre 60 et 760 ms après le chargement.

   Lancez d'abord vos exercices avec le bandeau actif :

       node lancer.js exercices-banniere

   Plusieurs de vos tests précédents vont devenir intermittents. C'est normal :
   c'est exactement à quoi ressemble un test « flaky ».

   Écrivez ensuite DEUX tests qui ajoutent trois articles au panier et
   vérifient que le badge affiche « 3 », en traitant le bandeau de deux
   façons différentes :

     a) avec un gestionnaire déclenché automatiquement
        (page.addLocatorHandler)
     b) en supprimant la cause : posez le cookie de consentement avant
        le chargement, le bandeau n'apparaît alors jamais

   Puis répondez en commentaire : laquelle des deux approches préférez-vous,
   et pourquoi ?

   Indices
     · le bandeau est un role="dialog" de nom accessible « Cookies »
     · await page.addLocatorHandler(locator, async (d) => { ... })
     · pour (b) : browser.newContext() puis context.addCookies([
         { name: 'consent', value: '1', domain: 'localhost', path: '/' }])
     · vos deux tests doivent passer AVEC ET SANS le bandeau actif
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e23a · un gestionnaire ferme le bandeau automatiquement', async ({ page }) => {
  // TODO
});

test.skip('e23b · supprimer la cause plutôt que la contourner', async ({ browser }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 24  ·  ★★★★☆  ·  Contrôles de sécurité
   ───────────────────────────────────────────────────────────────────────────
   Écrivez un test qui vérifie, sur la page d'accueil :
     a) l'en-tête « x-content-type-options » vaut « nosniff »
     b) un « content-security-policy » est présent
     c) un « strict-transport-security » est présent
     d) l'en-tête « x-powered-by » est ABSENT
     e) le HTML de la page ne contient aucune chaîne ressemblant à un secret
        (cherchez par exemple « sk_live_ » ou « BEGIN PRIVATE KEY »)

   Ces contrôles ne remplacent pas un test d'intrusion. Ils détectent une
   régression de configuration le jour même, pas au prochain audit annuel.

   Indices
     · const reponse = await page.goto('/'); puis reponse.headers()
     · await page.content() renvoie le HTML rendu
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e24 · les en-têtes de sécurité sont posés', async ({ page }) => {
  // TODO
});


/* ───────────────────────────────────────────────────────────────────────────
   EXERCICE 25  ·  ★★★★★  ·  Défi libre
   ───────────────────────────────────────────────────────────────────────────
   Choisissez un comportement de l'application que AUCUN exercice précédent
   ne couvre, et écrivez-en trois tests.

   Quelques pistes, à vous d'en trouver d'autres :
     · que se passe-t-il si l'on commande avec un panier vide ?
     · le badge du panier survit-il à une navigation entre pages ?
     · la recherche est-elle sensible à la casse et aux accents ?
     · peut-on ajouter deux fois le même article ? Le total suit-il ?
     · que voit un responsable sur /commandes, comparé à un client ?
     · le seuil de validation à 1000 € est-il strict ou inclusif ?
       (indice : lisez le code du serveur, puis écrivez le test qui tranche)

   CRITÈRES D'ÉVALUATION
     1. chaque test a un nom qui décrit un comportement, pas une manipulation
     2. aucun sélecteur CSS, aucune attente fixe
     3. chaque test peut tourner seul, dans n'importe quel ordre
     4. et surtout : cassez volontairement l'application ou modifiez une
        assertion, et vérifiez que vos tests deviennent ROUGES.
        Un test qui ne peut pas échouer ne vérifie rien.

   Si vous utilisez un assistant IA pour cet exercice, notez ce que vous avez
   dû corriger dans ce qu'il a proposé. C'est le retour le plus intéressant
   de la journée.
   ─────────────────────────────────────────────────────────────────────────── */
test.skip('e25a · à vous', async ({ page }) => {
  // TODO
});

test.skip('e25b · à vous', async ({ page }) => {
  // TODO
});

test.skip('e25c · à vous', async ({ page }) => {
  // TODO
});
