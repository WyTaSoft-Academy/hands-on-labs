# TP 2 — Créer et améliorer des tests avec l'IA

**≈ 75 minutes · en binôme · module 2**

Vous travaillez dans `mon-projet/`, le projet créé au TP 1.

## Déroulé

1. **Sans IA** : reprenez votre test du TP 1 et remplacez tous les sélecteurs par
   des locators par rôle, label ou texte.
2. **Avec Codegen** : enregistrez un second parcours, puis nettoyez le code
   produit : nommage, structure, assertions pertinentes.

   ```
   node ../app/serveur.js                         # dans un premier terminal
   npx playwright codegen http://localhost:3000   # dans un second
   ```

   Codegen ne démarre pas l'application : lancez-la d'abord.
3. **Avec l'IA** : rédigez un prompt complet — contexte, DOM, scénario,
   contraintes — pour générer un troisième test.
4. **Relecture** : passez le code généré à la checklist du module 2, corrigez ce
   qui doit l'être. API réelles ? Locators ? Attentes fixes ? Assertions métier ?
   Isolation ?
5. **Preuve** : cassez volontairement l'application et vérifiez que chacun de vos
   trois tests devient rouge. Par exemple, changez un libellé ou un prix dans
   `app/serveur.js`, relancez, puis annulez la modification.

## Livrable

Trois tests qui passent, dont un généré et corrigé, avec au moins une assertion
métier chacun.

## Question à trancher en binôme

Sur ce parcours précis, l'IA vous a-t-elle fait gagner du temps, ou en a-t-elle
coûté en relecture ? La réponse honnête est intéressante dans les deux sens.

## Pas d'assistant IA autorisé sur votre poste ?

La variante B saute la génération et garde la relecture : cinq tests « déjà
générés par une IA », à critiquer et réécrire.

```
cd tests
node lancer.js tp2-variante-b
```

Énoncé : [`../tests/tp2-variante-b/README.md`](../tests/tp2-variante-b/README.md).
