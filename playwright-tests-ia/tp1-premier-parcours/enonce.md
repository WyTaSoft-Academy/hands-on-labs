# TP 1 — Automatiser un parcours utilisateur simple

**≈ 60 minutes · en binôme · module 1**

## Ce que vous produisez

1. Installer Playwright dans un projet vide et vérifier que le test d'exemple passe.
2. Écrire un test qui ouvre la page d'accueil et vérifie son titre.
3. Écrire un test qui suit un parcours complet :
   - arriver sur la page d'accueil
   - saisir un terme dans la recherche
   - ouvrir le premier résultat
   - ajouter l'article au panier
   - vérifier que le panier affiche un article
4. Lancer la suite en mode `--ui`, puis en mode normal.

## Installer

Depuis le dossier `playwright-tests-ia/`, **à côté** de `tests/` et non dedans :

```
mkdir mon-projet
cd mon-projet
npm init playwright@latest        # TypeScript, dossier tests, pas de workflow CI
npx playwright test               # le test d'exemple doit passer
```

> **Ne créez pas ce projet dans `tests/`.** `npm init` y installerait un second
> Playwright, dans une autre version : les deux se chargent ensemble et plus rien
> ne démarre, avec un message (« Playwright was loaded twice ») qui ne dit pas
> d'où vient le problème.

Le test d'exemple vise `playwright.dev` : il demande un accès internet. Derrière
un proxy fermé, remplacez son `goto` par l'adresse locale.

## Brancher l'application

Dans le `playwright.config.ts` généré, **`baseURL` et `webServer` sont
commentés**. Décommentez-les et adaptez-les :

```ts
use: { baseURL: 'http://localhost:3000' },

webServer: {
  command: 'node ../app/serveur.js',
  url: 'http://localhost:3000/api/sante',
  reuseExistingServer: !process.env.CI,
  env: { DEMO_BANNIERE: '0' },   // sinon un bandeau rend le parcours instable
},
```

Sans `baseURL`, `page.goto('/')` échoue sur `Cannot navigate to invalid URL` :
c'est l'erreur la plus fréquente de ce TP.

Pour regarder l'application pendant que vous écrivez : `node ../app/serveur.js`,
puis <http://localhost:3000>.

## Points de vigilance

- Un `await` devant chaque action.
- Au moins une assertion par test.
- Des noms de tests qui décrivent le comportement, pas la technique.

## Si vous avez fini en avance

Faites échouer volontairement une assertion et observez le message d'erreur
produit. Nous nous en resservirons au module 3.

Puis enchaînez sur les exercices 1 à 5 : [`../tests/exercices/`](../tests/exercices/README.md).
