# TP 3 : suite de tests a fiabiliser

Cette suite contient **six tests volontairement mal ecrits**. Certains echouent
systematiquement, d'autres une fois sur deux ou trois.

## Lancer la suite

Depuis `tests`, la meme commande dans tous les terminaux :

```
node lancer.js tp3
```

Cette suite a sa propre configuration, `playwright.tp3.config.ts`, qui allume
deja le bandeau de consentement et force `workers: 1`. Rien a poser a la main.

> N'utilisez pas `npx playwright test tp3-suite-instable` : la configuration par
> defaut ecarte les dossiers `tp3-*`, la commande ne trouverait aucun test.

Relancez-la **cinq fois de suite** et notez lesquels varient.

Pour ouvrir le rapport apres coup : `npm run rapport`.

## Votre travail

1. Diagnostiquer : quels tests echouent, systematiquement ou par intermittence.
2. Instrumenter : ouvrir le Trace Viewer sur chaque echec. La trace est deja
   enregistree pour tous les tests de ce TP (`trace: 'on'` dans sa configuration).
3. Classer chaque defaut dans l'une des trois familles :
   **timing**, **selecteur**, **etat partage**.
4. Corriger, **sans jamais** ajouter d'attente fixe ni augmenter un timeout.
5. Restructurer : extraire ce qui se repete dans un Page Object.
6. Prouver : dix executions consecutives, dix fois vert.

## Livrable

La suite corrigee, plus un tableau : pour chaque test, la cause identifiee et
le correctif applique.
