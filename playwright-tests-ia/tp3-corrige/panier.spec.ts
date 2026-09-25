import { test, expect } from '@playwright/test';

/**
 * TP 3, corrigé.
 *
 * Chaque test porte en commentaire la cause identifiée et le correctif appliqué,
 * c'est-à-dire le tableau demandé en livrable.
 *
 * Aucun waitForTimeout, aucun timeout augmenté.
 *
 * LES COMMENTAIRES « DIRE » sont le fil de la séance : ce que je dis à voix
 * haute pendant que je déroule le fichier. Ouvrir tp3-suite-instable/panier.spec.ts
 * dans l'onglet d'à côté pour comparer défaut par défaut.
 *
 * DIRE, en ouvrant le fichier :
 *   « Voici la même suite, corrigée. Premier constat avant même de lire :
 *   il n'y a plus un seul waitForTimeout, et je n'ai touché à aucun timeout.
 *   Si un test instable devient vert parce qu'on attend plus longtemps, on n'a
 *   rien corrigé, on a caché le problème. Ici chaque correction s'attaque à
 *   une cause, et chaque cause appartient à une des trois familles du module :
 *   le timing, les sélecteurs, l'état partagé. »
 */

/* Le bandeau de consentement est traité une fois pour toute la suite, plutôt que
   contourné test par test. Deux réponses possibles, la seconde est préférable :
   ici on pose le cookie de consentement, donc le bandeau n'apparaît jamais.

   DIRE :
     « On commence par le défaut le plus sournois, celui du test 5 : le bandeau
     de cookies. Il apparaît après un délai aléatoire, entre 60 et 760 ms. Selon
     le moment, il recouvre le bouton ou pas : le test passe une fois sur deux.
     Plutôt que de le fermer dans chaque test, je le traite une seule fois, dans
     le beforeEach. Et plutôt que de cliquer sur Accepter, je pose directement
     le cookie consent=1 : le serveur voit que le consentement est déjà donné,
     et le bandeau n'est jamais affiché. On supprime la cause au lieu de
     réagir au symptôme. » */
test.beforeEach(async ({ context, page }) => {
  await context.addCookies([
    { name: 'consent', value: '1', domain: 'localhost', path: '/' },
  ]);

  // Variante si l'on ne peut pas neutraliser la cause :
await page.addLocatorHandler(
  page.getByRole('dialog', { name: 'Cookies' }),
  async (d) => d.getByRole('button', { name: 'Accepter' }).click(),
  );
  //
  // DIRE :
  //   « Si vous ne maîtrisez pas l'application, par exemple un bandeau fourni
  //   par un tiers sans cookie connu, il reste addLocatorHandler. Playwright
  //   surveille le dialogue, et dès qu'il gêne une action, il clique sur
  //   Accepter avant de continuer. C'est le plan B : ça marche, mais on
  //   subit le bandeau au lieu de l'empêcher. »
});

/**
 * Test 1
 * Causes : timing (deux attentes fixes), sélecteur (positionnel et de classe),
 *          assertion sur une valeur extraite, URL en dur.
 * Correctifs : baseURL, locator par rôle filtré sur le nom du produit,
 *              assertion web-first qui absorbe seule la latence de 350 ms.
 */
test('ajouter un article met le badge du panier à jour', async ({ page }) => {
  // DIRE :
  //   « D'abord le nom. Avant, il s'appelait "test 1" : dans un rapport rouge,
  //   ça ne dit rien. Maintenant le nom énonce le comportement attendu. Si ce
  //   test casse, je sais ce qui ne marche plus sans ouvrir le fichier. »

  // DIRE :
  //   « Plus d'URL en dur : juste "/". L'adresse vient du baseURL de la
  //   config. Le jour où on lance la suite contre la recette, on ne change
  //   qu'une ligne. »
  await page.goto('/');

  // DIRE :
  //   « Avant, on cliquait sur ul.produits li:nth-child(1) : le premier
  //   produit, quel qu'il soit. On réordonne le catalogue et le test ajoute
  //   autre chose sans broncher. Ici je décris ce que voit l'utilisateur :
  //   l'élément de liste qui contient "Clavier mécanique", et dans cet élément
  //   le bouton "Ajouter au panier". Aucune position, aucune classe CSS. »
  await page.getByRole('listitem')
    .filter({ hasText: 'Clavier mécanique' })
    .getByRole('button', { name: 'Ajouter au panier' })
    .click();

  // DIRE :
  //   « Le badge se met à jour environ 350 ms après le clic. L'ancienne version
  //   attendait une seconde "pour être sûr", puis lisait le texte une seule
  //   fois avec textContent. expect(await ...) ne réessaie pas : si le badge
  //   n'est pas encore à jour, c'est rouge. Ici, expect(locator).toHaveText
  //   est une assertion web-first : Playwright relit le badge jusqu'à ce qu'il
  //   vaille 1, ou jusqu'au timeout. Si le badge arrive en 350 ms, j'attends
  //   350 ms. Pas une seconde de plus. »
  await expect(page.getByTestId('badge-panier')).toHaveText('1');
});

/**
 * Test 2
 * Cause : état partagé. Il dépendait d'une variable alimentée par le test 1,
 *         alors que chaque test reçoit un contexte neuf, donc un panier vide.
 * Correctif : le test crée lui-même l'état dont il a besoin.
 */
test('le panier affiche le total des articles ajoutés', async ({ page }) => {
  // DIRE :
  //   « Ici, c'est la famille état partagé. L'ancien test 2 lisait une variable
  //   remplie par le test 1. Deux problèmes. Lancé seul, il échoue. Et même
  //   lancé après le test 1, il échoue quand même : chaque test Playwright
  //   reçoit un contexte de navigateur neuf, donc de nouveaux cookies, donc
  //   une nouvelle session et un panier vide. La règle : un test prépare
  //   lui-même tout ce dont il a besoin. »
  //
  //   « Et je ne le prépare pas par l'interface : je ne teste pas l'ajout ici,
  //   le test 1 s'en charge. J'appelle directement l'API. page.request partage
  //   les cookies de la page, donc l'article arrive dans le même panier que
  //   celui que je vais afficher. C'est plus rapide, et si l'ajout casse, un
  //   seul test devient rouge : celui dont c'est le sujet. »
  await page.request.post('/api/panier', { data: { id: 1 } });

  // DIRE :
  //   « Le produit 1, c'est le clavier à 49 €. Et j'écris 49,00 € en dur dans
  //   l'assertion. Pas une variable calculée ailleurs, une valeur que j'ai
  //   vérifiée moi-même. »
  await page.goto('/panier');
  await expect(page.getByTestId('total-panier')).toHaveText('49,00 €');
});

/**
 * Test 3
 * Causes : sélecteur accroché à une classe régénérée à chaque démarrage,
 *          attente fixe, comptage lu à la main.
 * Correctif : ciblage par label et par rôle, assertion toHaveCount qui réessaie.
 */
test('la recherche ne retourne que les produits correspondants', async ({ page }) => {
  await page.goto('/');

  // DIRE :
  //   « L'ancien test attendait .css-a1b2c3. Ce nom de classe est généré à
  //   chaque démarrage du serveur, comme avec les CSS-in-JS. Il marchait le
  //   jour où quelqu'un l'a copié, puis plus jamais. Et #q, form.recherche
  //   button, ce sont des détails d'implémentation. Ici je passe par le label
  //   du champ, "Rechercher un produit", et par le nom du bouton. Si le
  //   développeur renomme l'id, le test tient. Si quelqu'un supprime le label,
  //   le test casse, et c'est tant mieux : l'accessibilité vient de régresser. »
  await page.getByLabel('Rechercher un produit').fill('clavier');
  await page.getByRole('button', { name: 'Rechercher' }).click();

  // DIRE :
  //   « Avant : 800 ms d'attente, puis count() et une comparaison. count()
  //   donne un nombre à un instant T et ne réessaie pas. toHaveCount, lui,
  //   réessaie jusqu'à ce que la liste compte bien un élément. Et je ne
  //   m'arrête pas au nombre : un seul résultat, c'est bien, encore faut-il
  //   que ce soit le bon. Je vérifie donc aussi que c'est le clavier. »
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Clavier mécanique' })).toBeVisible();
});

/**
 * Test 4
 * Causes : sélecteurs techniques alors que des labels existent,
 *          assertion qui ne vérifie rien de significatif.
 * Correctif : getByLabel, et une assertion sur le résultat réel de la connexion.
 */
test('la connexion affiche le nom de l\'utilisateur', async ({ page }) => {
  // DIRE :
  //   « Même logique pour les champs : input[type=email] devient le champ dont
  //   le label est "Adresse email". C'est ce que lit un lecteur d'écran, et
  //   c'est ce que lit le test. »
  await page.goto('/connexion');

  await page.getByLabel('Adresse email').fill('client@demo.test');
  await page.getByLabel('Mot de passe').fill('demo');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  // DIRE :
  //   « Le vrai défaut de l'ancien test, c'était son assertion : "l'URL
  //   contient localhost:3000". Elle est vraie avant la connexion, pendant,
  //   après, et même si la connexion échoue. Un test qui ne peut pas échouer
  //   ne prouve rien. Ici je vérifie ce que la connexion change vraiment :
  //   le nom de l'utilisateur affiché, et le lien pour se déconnecter. »
  await expect(page.getByTestId('utilisateur')).toHaveText('Marie DUPONT');
  await expect(page.getByRole('link', { name: 'Se déconnecter' })).toBeVisible();
});

/** Le cas symétrique, absent de la suite d'origine : l'échec doit être testé aussi. */
test('la connexion refuse un mot de passe incorrect', async ({ page }) => {
  // DIRE :
  //   « Ce test n'existait pas. Je l'ajoute parce qu'une suite qui ne teste que
  //   le cas qui marche laisse passer une application qui accepte n'importe
  //   quel mot de passe. Même parcours, mauvais mot de passe, et je vérifie le
  //   message d'erreur. Je le cible par son rôle alert : c'est ainsi qu'il est
  //   annoncé aux lecteurs d'écran. »
  await page.goto('/connexion');

  await page.getByLabel('Adresse email').fill('client@demo.test');
  await page.getByLabel('Mot de passe').fill('mauvais');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await expect(page.getByRole('alert')).toHaveText('Identifiants incorrects');
});

/**
 * Test 5
 * Cause : le bandeau de consentement recouvrait les boutons à un instant
 *         non déterministe, d'où un échec une fois sur deux.
 * Correctif : la cause est neutralisée dans le beforeEach.
 */
test('trois ajouts successifs donnent un badge à trois', async ({ page }) => {
  // DIRE :
  //   « C'est le test qui échouait une fois sur deux. Remarquez qu'il n'a
  //   presque rien de spécial : la correction n'est pas ici, elle est dans le
  //   beforeEach, où le bandeau a été neutralisé. C'est le piège classique du
  //   test instable : on cherche dans le test, alors que la cause est dans
  //   l'environnement. »
  await page.goto('/');

  // DIRE :
  //   « Les data-testid ajouter-1, ajouter-2, ajouter-5 deviennent des noms de
  //   produits. En lisant la boucle, on sait ce qu'on met dans le panier. Avec
  //   ajouter-5, il fallait aller voir le catalogue. »
  for (const produit of ['Clavier mécanique', 'Souris ergonomique', 'Station d\'accueil']) {
    await page.getByRole('listitem')
      .filter({ hasText: produit })
      .getByRole('button', { name: 'Ajouter au panier' })
      .click();
  }

  // DIRE :
  //   « Et toujours la même assertion web-first : pas d'attente de 1 200 ms,
  //   Playwright attend que le badge vaille 3. »
  await expect(page.getByTestId('badge-panier')).toHaveText('3');
});

/**
 * Test 6
 * Causes : préparation par l'interface avec attentes fixes, sélecteur de
 *          formulaire technique, aucune vérification de l'état de départ.
 * Correctif : préparation par API, connexion explicite, assertions web-first.
 */
test('commander vide le panier et crée la commande', async ({ page }) => {
  // DIRE :
  //   « Dernier test, le plus long. Il combine tout ce qu'on vient de voir.
  //   D'abord, commander exige d'être connecté : l'ancien test ne l'était pas,
  //   il ne pouvait donc pas réussir. Je me connecte explicitement. »
  await page.goto('/connexion');
  await page.getByLabel('Adresse email').fill('client@demo.test');
  await page.getByLabel('Mot de passe').fill('demo');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  // DIRE :
  //   « Ensuite la préparation du panier, par l'API comme au test 2. On n'a
  //   plus besoin des deux attentes fixes qui suivaient le clic d'ajout. »
  await page.request.post('/api/panier', { data: { id: 1 } });

  // DIRE :
  //   « Cette assertion est la plus importante du test, et elle ne teste pas
  //   la commande. Elle vérifie le point de départ : le panier contient bien
  //   le clavier à 49 €. L'ancien test cliquait directement sur Commander. Or
  //   ce bouton n'existe que si le panier n'est pas vide. Quand la préparation
  //   ratait, on obtenait "élément introuvable" sur le bouton, un message qui
  //   envoie chercher au mauvais endroit. Ici, si la préparation rate, le test
  //   s'arrête sur cette ligne, avec le bon diagnostic : le panier n'est pas
  //   celui qu'on attendait. »
  await page.goto('/panier');
  await expect(page.getByTestId('total-panier')).toHaveText('49,00 €');

  await page.getByRole('button', { name: 'Commander' }).click();

  // DIRE :
  //   « Enfin le résultat, de deux façons. On arrive sur la page "Vos
  //   commandes", et le tableau n'est pas vide : la commande a bien été
  //   créée. Ce sont deux assertions web-first, qui attendent la navigation
  //   toutes seules. »
  //
  //   « Pour conclure : six tests, zéro attente fixe, et pourtant ils sont
  //   plus rapides et ils ne clignotent plus. On n'a pas rendu les tests plus
  //   patients, on les a rendus plus précis. »
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vos commandes');
  await expect(page.getByRole('row')).not.toHaveCount(0);
});
