# Exercice — Lire le SQL d'un moteur : corrigé

> **Il n'y a pas de corrigé unique.** Les décisions ci-dessous sont celles qu'il faut
> avoir vues. Un binôme qui en trouve d'autres a raison s'il sait dire où elles sont
> dans le SQL et ce qu'elles changent au chiffre.

---

## A. « Quel était l'encours de crédit en 2025 ? »

| La décision | Où, dans le SQL | L'effet | Ce qu'il aurait fallu écrire |
|---|---|---|---|
| Sommer l'encours sur **toutes les photos mensuelles** de l'année | `SUM(...)` avec `DT_ARR BETWEEN … 2025-12-31` | **Environ douze fois trop grand** : chaque crédit vivant toute l'année est compté douze fois | Le grain de `F_CRD_MNS` (un crédit × un mois), et que l'encours est un stock : on prend le dernier arrêté, jamais la somme |
| « En 2025 » = **toute l'année**, alors que pour un stock la question attend une photo : fin d'année, ou une moyenne assumée | `BETWEEN '2025-01-01' AND '2025-12-31'` | Un autre indicateur que celui demandé | La date de référence de la mesure, et sa règle d'agrégation dans le temps |
| **Aucun filtre sur le statut** : crédits en contentieux inclus | absence de condition sur `CD_STA` | Un périmètre qui n'a peut-être pas été voulu | Le filtre implicite de la mesure, décidé une fois par écrit |

La requête attendue, si l'on retient le dernier arrêté de l'année :

```sql
SELECT SUM(f.MT_CRD_RST) AS encours
FROM   F_CRD_MNS f
WHERE  f.DT_ARR = DATE '2025-12-31';
```

> C'est l'erreur de grain de ce matin, à l'état pur : **aucune erreur technique**, un
> chiffre douze fois trop grand, et un joli graphique.

---

## B. « Combien nos clients ont-ils reçu en virements en septembre ? »

| La décision | Où, dans le SQL | L'effet | Ce qu'il aurait fallu écrire |
|---|---|---|---|
| **Ignorer le sens** de l'opération : virements émis et reçus additionnés | absence de condition sur `SNS` | **Trop grand** : la question ne porte que sur les virements reçus | Des valeurs lisibles pour `SNS` (débit, crédit) et le synonyme « reçu » |
| Prendre la **date de comptabilisation** plutôt que la date d'opération | `o.DT_CPT BETWEEN …` | Un autre périmètre : un virement du 30 septembre comptabilisé le 1er octobre sort du mois | La date qui fait foi par défaut pour les opérations, et le nom explicite de l'autre |
| « Septembre » = **septembre 2026** | `DATE '2026-09-01'` | Raisonnable, mais décidé sans le dire | Une dimension date, pour que « septembre » ait une définition écrite |
| `VIR` = virement | `CD_TYP = 'VIR'` | Probablement juste, mais deviné depuis un code | Le libellé en clair des types d'opération |

---

## C. « Quel est le montant moyen d'un crédit à la consommation ? »

| La décision | Où, dans le SQL | L'effet | Ce qu'il aurait fallu écrire |
|---|---|---|---|
| Faire la moyenne sur les **lignes mensuelles**, pas sur les crédits | `AVG(f.MT_OCT)` sur `F_CRD_MNS` | **Biaisé** : un crédit présent 60 mois pèse cinq fois plus qu'un crédit présent 12 mois | Le grain de la table, et que le montant octroyé se lit **au grain crédit** |
| **Toute l'histoire** de la table, sans période | aucune condition de date | Un autre périmètre : des crédits octroyés il y a des années | La date de référence de la mesure, ou une période par défaut |
| « Consommation » = `CD_SFAM = 'CONSO'` | `p.CD_SFAM = 'CONSO'` | Probablement juste, mais deviné depuis un code | La hiérarchie produit en libellés |

La requête attendue lit chaque crédit une seule fois :

```sql
SELECT AVG(c.MT_OCT) AS montant_moyen
FROM  (SELECT DISTINCT f.ID_CRD, f.MT_OCT
       FROM   F_CRD_MNS f
       JOIN   D_PRD p ON p.CD_PRD = f.CD_PRD
       WHERE  p.CD_SFAM = 'CONSO') c;
```

> Une moyenne est un ratio : un total divisé par un nombre. **Le nombre, c'est le
> grain** : ici des lignes, alors que la question compte des crédits.

---

## D. « Combien de clients ont un crédit en contentieux ? »

| La décision | Où, dans le SQL | L'effet | Ce qu'il aurait fallu écrire |
|---|---|---|---|
| Compter des **lignes**, pas des clients | `COUNT(*)` | **Trop grand** : un client compte une fois par crédit et par mois | Le grain de la table, et une mesure de comptage distinct sur la clé client |
| **Aucune date** : tous les arrêtés confondus | absence de condition sur `DT_ARR` | Un autre périmètre : les clients qui ont été en contentieux un jour, pas ceux qui le sont | La date de référence par défaut : le dernier arrêté |
| `CT` = contentieux | `CD_STA = 'CT'` | Probablement juste, mais deviné depuis un code | Les libellés des statuts |

La requête attendue :

```sql
SELECT COUNT(DISTINCT f.ID_CLI) AS nb_clients
FROM   F_CRD_MNS f
WHERE  f.CD_STA = 'CT'
  AND  f.DT_ARR = (SELECT MAX(DT_ARR) FROM F_CRD_MNS);
```

---

## Ce qu'il faut retenir en restitution

**Treize décisions, aucune annoncée.** Les quatre requêtes s'exécutent, et le moteur
n'a signalé aucun de ses choix. Sans le SQL, aucun lecteur n'aurait pu les voir : d'où
la première exigence envers un outil NLQ, qu'il montre le SQL généré.

**Les mêmes causes reviennent.** Le grain (A, C, D), la date qui fait foi (A, B, D),
et les codes devinés (B, C, D). C'est la grille du TP de cet après-midi : il s'agira
de trouver les mêmes défauts, mais dans le modèle, avant qu'une requête ne les révèle.

**Les codes devinés juste ne sont pas une réussite.** `VIR`, `CONSO` et `CT` ont
probablement été bien interprétés. Mais le moteur n'avait aucun moyen de le savoir, et
personne n'a validé son interprétation : la prochaine fois, ce sera `PE` ou `PR`.
