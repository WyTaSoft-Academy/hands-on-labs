# Exercice — Lire le SQL d'un moteur

**Durée :** 25 min de travail + 10 min de restitution · **En binôme**, de préférence un profil technique avec un profil métier.

---

## La situation

Le métier a posé quatre questions en français à un moteur NLQ branché directement sur
l'entrepôt. Le moteur a répondu à chacune, sans hésiter, avec un chiffre. Bonne
nouvelle : il **montre le SQL qu'il a généré**.

Votre travail : lire ce SQL comme on relit le calcul d'un collègue, et retrouver
**les décisions que le moteur a prises à votre place, sans le dire**.

Le modèle interrogé est celui du TP de cet après-midi :
[`socle/modele-socle-participant.sql`](socle/modele-socle-participant.sql). Les noms,
les types et quelques valeurs de codes : rien d'autre.

> **Il n'y a pas d'erreur de syntaxe.** Les quatre requêtes s'exécutent, et rendent
> un chiffre plausible. C'est précisément le problème.

---

## Les quatre questions, et le SQL généré

### A. « Quel était l'encours de crédit en 2025 ? »

```sql
SELECT SUM(f.MT_CRD_RST) AS encours
FROM   F_CRD_MNS f
WHERE  f.DT_ARR BETWEEN DATE '2025-01-01' AND DATE '2025-12-31';
```

### B. « Combien nos clients ont-ils reçu en virements en septembre ? »

```sql
SELECT SUM(o.MT_OPE) AS montant_virements
FROM   F_OPE o
WHERE  o.CD_TYP = 'VIR'
  AND  o.DT_CPT BETWEEN DATE '2026-09-01' AND DATE '2026-09-30';
```

### C. « Quel est le montant moyen d'un crédit à la consommation ? »

```sql
SELECT AVG(f.MT_OCT) AS montant_moyen
FROM   F_CRD_MNS f
JOIN   D_PRD p ON p.CD_PRD = f.CD_PRD
WHERE  p.CD_SFAM = 'CONSO';
```

### D. « Combien de clients ont un crédit en contentieux ? »

```sql
SELECT COUNT(*) AS nb_clients
FROM   F_CRD_MNS f
WHERE  f.CD_STA = 'CT';
```

---

## Ce que vous produisez

Pour chaque requête, **au moins deux décisions prises en silence**. Pour chacune :

| Colonne | Ce qu'on y écrit |
|---|---|
| **La décision** | Ce que le moteur a tranché, en une phrase de métier |
| **Où, dans le SQL** | La ligne ou l'expression qui la porte |
| **L'effet sur le chiffre** | Trop grand, trop petit, ou un autre périmètre que celui demandé |
| **Ce qu'il aurait fallu écrire** | La déclaration qui aurait évité au moteur de deviner |

```
Req.  Décision prise en silence      Où dans le SQL          Effet        À déclarer
----  -----------------------------  ----------------------  -----------  ------------------
A     ............................   ....................    ..........   ................
A     ............................   ....................    ..........   ................
B     ...
```

---

## Deux conseils

**Lisez chaque requête à voix haute, en français.** « Je somme le capital restant dû
de toutes les lignes dont la date d'arrêté est en 2025. » Puis relisez la question du
métier. L'écart entre les deux phrases, ce sont les décisions.

**Vérifiez ce que compte chaque ligne.** Une requête qui compte ou somme des lignes
n'est juste que si une ligne vaut bien ce que la question compte. Le test du grain de
ce matin s'applique ici : « ceci est un… ».

---

Le corrigé est présenté en restitution.
