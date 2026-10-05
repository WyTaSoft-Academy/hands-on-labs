# TP 1 bis — Prouver le diagnostic

**Durée :** 50 min de travail + 15 min de restitution · **En binôme**, même binôme qu'au TP 1, avec au moins un profil à l'aise en SQL.

---

## La situation

Vous avez rendu votre diagnostic : aucune des douze questions ne passe sans que le
moteur ait à deviner, et trois défauts coûtent plus cher que les autres.

La direction a lu votre grille. Sa réponse tient en une phrase :

> « Ambigu, d'accord. Mais ça fait combien ? »

Un diagnostic écrit se discute. Un écart chiffré, sur les données de la banque, ne se
discute plus. On vous donne `SOCLE` **rempli** : à vous de montrer, requêtes à
l'appui, que chaque défaut produit des chiffres différents.

---

## Ce qu'on vous remet

[`socle/socle-donnees-duckdb.sql`](socle/socle-donnees-duckdb.sql) : les six tables
de `SOCLE`, mêmes noms, mêmes colonnes, remplies d'une petite banque fictive.

```
duckdb socle.duckdb -c ".read socle/socle-donnees-duckdb.sql"
duckdb -ui socle.duckdb
```

La première commande crée la base, la seconde ouvre l'interface dans le navigateur.
À défaut, la console `duckdb socle.duckdb` suffit.

**Sur Snowflake**, le même jeu de données est dans
[`socle/socle-donnees-snowflake.sql`](socle/socle-donnees-snowflake.sql) : l'ouvrir
dans une worksheet Snowsight, choisir un schéma où vous pouvez créer des tables (un
schéma par binôme), et tout exécuter. Les données et les chiffres sont identiques.

**Les conventions du jour**, pour que toutes les équipes parlent des mêmes dates :

| Dans la question | On lit |
|---|---|
| « au dernier arrêté » | le 30 septembre 2026 |
| « le mois dernier » | septembre 2026 |
| « ce trimestre » | le troisième trimestre 2026 |

> Ouvrez les tables, pas le script : il a été écrit pour générer les données, pas
> pour être lu. Vous en sauriez plus qu'un moteur NLQ, ce qui fausserait l'exercice.

---

## La consigne

Choisissez **trois défauts** de votre diagnostic, de préférence vos trois défauts les
plus coûteux. Pour chacun, partez d'une des douze questions qu'il touche, et écrivez :

1. **Lecture 1** : une requête qu'un moteur pourrait raisonnablement écrire.
2. **Lecture 2** : une autre requête, tout aussi défendable, sur le même modèle.
3. **L'écart** : les deux chiffres, et l'écart en valeur ou en pourcentage.
4. **La cause**, avec le vocabulaire du TP 1.

> **La règle du jeu : deux lectures défendables.** Une requête absurde donne
> évidemment un autre chiffre, et cela ne prouve rien. Chacune de vos deux requêtes
> doit pouvoir être défendue devant le métier comme *une* façon de comprendre la
> question. Si un binôme voisin trouve l'une des deux indéfendable, le défaut n'est
> pas prouvé.

---

## Ce que vous produisez

```
Défaut      Question   Lecture 1 → chiffre     Lecture 2 → chiffre     Écart    Cause
---------   --------   ---------------------   ---------------------   ------   ---------
1 .......   Q.         ...........  → ......   ...........  → ......   ......   .........
2 .......   Q.         ...........  → ......   ...........  → ......   ......   .........
3 .......   Q.         ...........  → ......   ...........  → ......   ......   .........
```

Gardez les requêtes : elles se lisent en restitution.

### Deux défis, pour les binômes en avance

- **Inverser un classement.** Trouvez une question où les deux lectures ne donnent
  pas seulement deux chiffres, mais **deux réponses différentes** : un autre premier,
  un autre ordre.
- **Prouver une absence.** Pour une des questions que vous avez jugées sans réponse,
  montrez par une requête que l'information n'existe pas dans le modèle.

---

## Trois conseils

**Explorez avant de prouver.** Dix minutes de `SELECT * … LIMIT 20` et de
`COUNT(*) … GROUP BY` sur chaque table. Les écarts se trouvent dans les données
avant de se trouver dans les requêtes.

**Le test du grain, en données.** Pour une table de faits, comptez les lignes par
identifiant : `SELECT ID_CRD, COUNT(*) FROM F_CRD_MNS GROUP BY ID_CRD`. Si un crédit
a plus d'une ligne, sommer cette table demande une précaution.

**Suivez un individu.** Prenez un client, un crédit ou un compte, et regardez tout
ce que le modèle dit de lui, table par table. Les contradictions entre deux colonnes
se voient mieux sur une ligne que sur un total.

---

## Attention

Les données sont **petites et inventées**. Un écart de 5 % ici ne dit pas que l'écart
est de 5 % en production : il prouve seulement que l'écart **existe**, et que le
modèle laisse les deux lectures passer sans avertir. C'est tout ce qu'on demande à
une preuve.

Le corrigé est présenté en restitution.
