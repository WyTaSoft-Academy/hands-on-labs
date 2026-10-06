# TP 1 bis — Prouver le diagnostic : corrigé

> **Il n'y a pas de corrigé unique.** Ce document donne, pour chaque question, deux
> lectures défendables et l'écart qu'elles produisent sur `socle-donnees-duckdb.sql`.
> Un binôme qui prouve le même défaut par une autre paire de requêtes a raison, à
> condition que les deux lectures soient défendables.

Toutes les requêtes ci-dessous sont dans [`tp1-demo-duckdb.sql`](tp1-demo-duckdb.sql),
prêtes à rejouer en restitution :

```
duckdb -c ".read tp1-demo-duckdb.sql"
```

---

## Les écarts attendus

| Q | Cause | Lecture 1 | Lecture 2 | Écart |
|---|---|---|---|---|
| 1 | `JOINTURE IMPLICITE` | Région de l'agence du **crédit** : ARA 544 017 · IDF 478 167 | Région de l'agence du **client** : ARA 403 017 · IDF 619 167 | **L'ordre des régions s'inverse** |
| 1 | `GRAIN` | Au dernier arrêté : ARA 544 017 | Toutes les photos sommées : ARA 30 982 017 | × 57 |
| 2 | `AMBIGUÏTÉ SÉMANTIQUE` | `TOP_ACT = 'O'` : 9 | Sans date de sortie : 10 | 9 ou 10, et pas les mêmes 9 |
| 3 | `MESURE ABSENTE` + `DATE` | `SUM(MT_OCT)` à l'arrêté de septembre : 1 285 000 | Crédits débloqués en septembre : 228 000 | × 5,6 |
| 4 | `AGRÉGATION` | `AVG(TX_NOM)` : 2,325 % | Pondéré par le capital : 2,698 % | 0,37 point |
| 5 | `DATE` | Sur `DT_OPE` : CB 4 · CHQ 0 · PRL 3 · VIR 5 | Sur `DT_CPT` : CB 3 · CHQ 1 · PRL 2 · VIR 4 | Chaque type bouge |
| 6 | `DATE` | Tous les comptes courants : 3 436,98 | Comptes non clôturés : 4 964,53 | Aucun des deux n'est daté |
| 7 | `GRAIN` | Au dernier arrêté : **Paris** 1er | Toutes les photos : **Lyon** 1er | **Le premier change** |
| 8 | `GRAIN` + `AMBIGUÏTÉ` | Sur les lignes : 55,0 ans | Clients avec crédit en cours : 41,9 ans | 13 ans |
| 9 | `AGRÉGATION` | Ratio des sommes : 2,40 % | Moyenne des ratios d'agence : 8,28 % | × 3,5 |
| 10 | `AMBIGUÏTÉ SÉMANTIQUE` | `DT_SOR` dans le trimestre : 2 | Dernier compte clos dans le trimestre : 3 | 2 ou 3 |
| 11, 12 | `DONNÉE INEXISTANTE` | Recherche d'une colonne « satisfaction » ou « canal » | — | Zéro colonne |

---

## Ce qu'il y a derrière chaque écart

Les données ont été construites pour que chaque défaut du modèle se voie sur un cas
précis. Si un binôme bute, orientez-le vers l'individu concerné.

| Individu | Ce qu'il montre | Question |
|---|---|---|
| Client 4 | Son crédit est à Grenoble, il est rattaché à Paris : il a déménagé | Q1 |
| Crédit 1 | 300 000 € depuis 2019 à Lyon : 93 photos mensuelles | Q1, Q7 |
| Crédit 3 | 400 000 € débloqué en janvier 2026 à Paris : 9 photos seulement | Q7 |
| Client 9 | `TOP_ACT = 'N'`, mais un crédit débloqué en août et des opérations | Q2 |
| Client 10 | Sorti en août 2026, `TOP_ACT` toujours à `'O'` | Q2, Q10 |
| Client 12 | Tous ses comptes fermés en septembre, `DT_SOR` vide | Q10 |
| Client 2 | 79 ans, son seul crédit est soldé depuis 2023, mais il reste dans la table | Q8 |
| Client 6 | Une société : pas de date de naissance, `AVG` l'ignore sans le dire | Q8 |
| Crédits 7 et 11 | Les deux seuls douteux, tous deux à Nanterre, la plus petite agence | Q9 |
| Opérations du 29 au 31 | Comptabilisées le mois suivant | Q5 |
| Dernière photo d'un crédit | `CD_STA = 'SO'` et capital nul : les soldés restent | Q3, Q8 |

---

## Les deux défis

**Inverser un classement.** Deux réponses possibles, et elles sont les plus fortes de
l'exercice :

- **Q7** : au dernier arrêté, Paris porte le plus d'encours (438 100) ; en sommant
  toutes les photos, c'est Lyon (23 243 017 contre 3 915 900). Le portefeuille ancien
  de Lyon a accumulé 93 photos, celui de Paris 9.
- **Q1** : par l'agence du crédit, ARA devance IDF ; par l'agence du client, c'est
  l'inverse. Un seul client a déménagé, et cela suffit.

**Prouver une absence.**

```sql
SELECT table_name, column_name
FROM   information_schema.columns
WHERE  regexp_matches(column_name, 'SAT|NPS|NOTE|CAN|CNL|CHN', 'i');
```

Zéro ligne. Un binôme qui propose `ID_AGE` comme canal n'a pas prouvé une absence :
il a fabriqué une substitution. C'est le faux ami du corrigé du TP 1.

---

## Les lectures qu'il faut refuser

La règle « deux lectures défendables » se joue en restitution. Exemples à ne pas
valider :

- **`SUM(TX_NOM)`** pour un taux moyen. Personne ne le défendrait : ce n'est pas une
  lecture, c'est une faute.
- **Une date inventée**, par exemple « le mois dernier » = août 2026. Les conventions
  du jour fixent septembre ; changer de mois ne prouve pas le défaut `DATE`, cela
  change la question.
- **Un filtre arbitraire** ajouté pour faire bouger le chiffre, par exemple exclure
  une agence. Une lecture doit venir du sens de la question, pas du besoin d'un écart.

À l'inverse, deux lectures **que personne dans la salle n'arrive à départager** sont
la meilleure preuve possible : c'est exactement la décision qu'un moteur prendra seul.

---

## Ce que la restitution doit faire apparaître

1. **Les écarts ne sont pas des arrondis.** × 57, × 5,6, × 3,5, et deux classements
   inversés. Sur un vrai entrepôt, les facteurs changent ; leur existence, non.
2. **Aucune des requêtes n'a échoué.** Toutes s'exécutent, toutes renvoient un
   nombre du bon type, dans la bonne unité. Rien dans le résultat ne signale qu'une
   autre lecture existait.
3. **Les écarts se rangent sous les mêmes causes que le TP 1.** Le grain produit les
   plus gros facteurs ; l'ambiguïté produit les écarts les plus petits, et donc les
   plus difficiles à repérer. Q2 est l'exemple : 9 ou 10, personne ne vérifiera.
4. **La transition vers le TP 2.** Chaque paire de lectures se termine par la même
   question : *qu'aurait-il fallu écrire pour qu'il n'y en ait qu'une ?* C'est
   le travail de demain.
