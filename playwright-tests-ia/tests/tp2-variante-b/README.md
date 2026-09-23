# TP 2 — variante B, sans assistant IA

À utiliser quand la DSI cliente n'autorise aucun assistant sur les postes.
Le TP 2 nominal consiste à *générer* des tests avec l'IA puis à les relire.
Ici, la génération est déjà faite : il reste la partie qui compte, **la relecture**.

## Lancer

```
node lancer.js tp2-variante-b
```

Attendu : **3 échecs et 2 réussites**. Les deux qui passent sont le cœur de
l'exercice — ils ne vérifient rien.

## Votre travail

Pour chacun des cinq tests :

1. Passez-le à la **checklist de relecture** du module 2 : API réelles ?
   locators ? attentes fixes ? assertions métier ? isolation ?
2. Écrivez en une phrase ce qui ne va pas.
3. Réécrivez-le.
4. Prouvez-le : cassez volontairement l'application, le test doit devenir rouge.

Le corrigé est présenté en séance, après votre relecture.
