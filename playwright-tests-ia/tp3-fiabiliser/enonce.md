# TP 3 — Fiabiliser une suite de tests existante

**≈ 75 minutes · en binôme · module 3**

## Le point de départ

Une suite de six tests vous est fournie :
[`../tests/tp3-suite-instable/`](../tests/tp3-suite-instable/). Quatre échouent
systématiquement, un une fois sur deux, un seul passe. Aucun n'est bien écrit.

```
cd tests
node lancer.js tp3
```

Sa configuration allume déjà le bandeau de consentement, force un seul worker et
enregistre une trace pour chaque test. Rien à poser à la main.

## Déroulé

1. **Diagnostiquer** : lancez la suite plusieurs fois, relevez lesquels sont instables.
2. **Instrumenter** : ouvrez le Trace Viewer sur chaque échec (`npm run rapport`).
3. **Classer** chaque défaut : timing, sélecteur, ou état partagé.
4. **Corriger**, sans jamais augmenter un timeout ni ajouter d'attente fixe.
5. **Restructurer** : extrayez le parcours de connexion dans un Page Object.
6. **Prouver** : dix exécutions consécutives, dix fois vert.

   ```
   node lancer.js tp3 --repeat-each=10
   ```

## Contrainte

Interdiction d'utiliser `waitForTimeout` et d'augmenter un timeout. Si vous en
avez envie, c'est que la cause n'est pas encore trouvée.

## Livrable

La suite corrigée, plus un court tableau : pour chaque test, la cause identifiée
et le correctif appliqué.

| Test | Famille | Cause | Correctif |
|---|---|---|---|
| test 1 | | | |
| … | | | |

## Aide autorisée

L'IA est autorisée, à condition de lui fournir la trace et de justifier chaque
correctif retenu.

## Si vous bloquez

Dans le journal d'appels du message d'erreur, cherchez la ligne
*locator resolved to*. Si elle manque, le problème est le sélecteur, pas la valeur.
