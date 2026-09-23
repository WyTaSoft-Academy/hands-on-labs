# Travaux pratiques : Playwright et IA

Quatre TP et 25 exercices sur une seule application : **Boutique interne**, un
petit catalogue avec panier, connexion et commandes. Tout vise **Playwright
1.63.0** et tourne sur le poste du participant.

## Installer le poste

Node.js 18 ou plus. Puis, une fois :

```
cd tests
npm install
npx playwright install chromium
```

Chromium suffit jusqu'au TP 3. Firefox et WebKit ne servent qu'au TP 4.

## L'application

Un seul fichier Node, **aucune dépendance** :

```
node app/serveur.js        →  http://localhost:3000
```

**Comptes** : `client@demo.test` et `responsable@demo.test`, mot de passe `demo`.

Les tests la démarrent et l'arrêtent eux-mêmes : ne la lancez à la main que
pour la regarder. **Arrêtez-la (Ctrl+C) avant de lancer une suite**, sinon
Playwright réutilise celle qui tourne, avec ses réglages.

Elle porte des défauts **volontaires** : une classe CSS régénérée à chaque
démarrage, un badge de panier mis à jour avec 350 ms de retard, un bandeau de
consentement qui surgit au hasard. Ce ne sont pas des bugs, ce sont les sujets
des exercices.

## Les quatre TP

| Dossier | Module | Ce qu'on fait |
|---|---|---|
| [`tp1-premier-parcours/`](tp1-premier-parcours/enonce.md) | 1 · Découvrir Playwright | Installer, écrire un premier parcours : recherche, fiche, panier |
| [`tp2-tests-ia/`](tp2-tests-ia/enonce.md) | 2 · Tests fiables | Locators robustes, Codegen, générer un test par IA et le relire |
| [`tp3-fiabiliser/`](tp3-fiabiliser/enonce.md) | 3 · Structurer et déboguer | Diagnostiquer et corriger une suite instable, Trace Viewer, Page Object |
| [`tp4-industrialiser/`](tp4-industrialiser/enonce.md) | 4 · Industrialiser | Mocking réseau, fixture, `storageState`, multi-navigateurs, CI |

Les TP 1, 2 et 4 se font dans votre propre projet, `mon-projet/`, créé au TP 1
à côté de `tests/`. Le TP 3 part d'une suite fournie.

## Les exercices

25 exercices gradués, un niveau par module, avec énoncés et indices dans les
fichiers : [`tests/exercices/`](tests/exercices/README.md).

```
cd tests
node lancer.js exercices --ui
```

## Lancer

`lancer.js` pose lui-même les variables d'environnement : la même commande
marche sous PowerShell, cmd et bash.

```
cd tests
node lancer.js                    liste les scénarios
node lancer.js exercices --ui     les exercices
node lancer.js tp2-variante-b     le TP 2 sans assistant IA
node lancer.js tp3                la suite instable du TP 3
npm run rapport                   le dernier rapport HTML
```

Toute option supplémentaire est transmise à Playwright : `--ui`, `--headed`,
`--debug`, `--repeat-each=10`, `-g`, un chemin de fichier.

## Si la syntaxe vous freine

[`FICHE-JAVASCRIPT.md`](FICHE-JAVASCRIPT.md) : imports, `async`/`await`,
déstructuration, et la lecture d'un message d'erreur.
