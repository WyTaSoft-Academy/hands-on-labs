# TP 0 : lire un lakehouse en 30 minutes

**Module 1 · ≈ 30 min, restitution comprise · individuel**

Avant de construire la Banque Lumen, on apprend à lire un lakehouse qui existe déjà : celui de
**Bakehouse**, une chaîne fictive de 48 boulangeries franchisées, fournie par Databricks dans le
catalog `samples`. Quatre missions, quatre questions. On ne crée rien : tout se fait dans le
**SQL editor**, sur le SQL warehouse partagé `wh-dki-formation`.

À la fin, vous collerez trois réponses dans le chat.

---

## Étape 0 · Se connecter (≈ 3 min)

1. Ouvrez l'URL du workspace donnée par le formateur (`adb-….azuredatabricks.net`) et connectez-vous
   avec votre compte de formation.
2. En haut à droite, votre profil → *Settings* → *Preferences* → *Language* : **English**. Les
   slides et la documentation emploient les noms anglais de l'interface.

## Mission 1 · Où suis-je ? (≈ 5 min)

Dans le *SQL Editor*, choisissez le warehouse `wh-dki-formation` en haut de l'éditeur.

1. `SELECT current_user(), current_catalog();` : qui êtes-vous, et dans quel catalog
   travaillez-vous par défaut ?
2. `SHOW CATALOGS;` : quels catalogs voyez-vous ?
3. Listez les tables du schema `bakehouse` du catalog `samples`. Le nom complet d'une table a
   **trois niveaux** : lesquels ?
4. Dans *SQL Warehouses* : le **type**, la **size** et l'**auto stop** de `wh-dki-formation`.

## Mission 2 · Sous le capot (≈ 7 min)

Dans *Catalog*, ouvrez `samples` → `bakehouse` → `sales_transactions`.

1. Onglets *Overview* et *Sample data* : combien de colonnes ? L'une d'elles ne devrait pas être
   visible de tout le monde dans une vraie entreprise : laquelle ?
2. Onglet *Details* : quel **type** de table ? Où sont **stockés** ses fichiers (*Storage
   location*) ? Est-ce le même endroit que le warehouse qui exécute vos requêtes ?
3. Dans le SQL Editor :

   ```sql
   DESCRIBE HISTORY samples.bakehouse.sales_transactions;
   ```

   Combien de **versions** la table a-t-elle connues ? Quelles opérations ont créé les dernières ?

## Mission 3 · Une question métier (≈ 10 min)

1. Combien de transactions, pour quel chiffre d'affaires (`totalPrice`), et sur quelle période
   (`dateTime`) ?
2. Les **cinq franchises** qui ont fait le plus de chiffre d'affaires : leur nom, leur ville, leur
   nombre de transactions et leur chiffre d'affaires. Il faut joindre `sales_transactions` et
   `sales_franchises` sur `franchiseID`.
3. Sous le résultat : *+* → *Visualization*, un graphique en barres du chiffre d'affaires par
   franchise.
4. Quelle franchise a le **plus de transactions** ? Est-ce aussi celle qui fait le plus de chiffre
   d'affaires ? Attention : regardez combien de franchises portent le même nom.

## Mission 4 · Les limites et le coût (≈ 5 min)

1. Essayez d'écrire dans `samples` :

   ```sql
   CREATE TABLE samples.bakehouse.essai AS SELECT 1 AS x;
   ```

   Lisez le message d'erreur : **qui** refuse ? L'assistant propose peut-être une correction :
   la suivriez-vous ? Refusez-la (*Reject*).
2. Relancez **à l'identique** votre requête des cinq franchises. Dans *Query History*, ouvrez
   ses deux exécutions : combien de lignes chacune a-t-elle lues, et combien de temps a-t-elle pris ?
   Pourquoi la seconde est-elle si rapide, et que vous coûte-t-elle ?

## Bonus

Dans le SQL Editor, demandez à l'assistant (*Genie Code*) en français : « Quel est le produit le
plus vendu en quantité dans samples.bakehouse.sales_transactions ? ». Lisez le SQL qu'il propose
avant de l'exécuter : est-ce celui que vous auriez écrit ?

---

## Ce qu'on attend en fin de TP

| Question | Votre réponse |
|---|---|
| Les trois niveaux du nom d'une table | |
| La colonne qui ne devrait pas être visible de tous | |
| Le nombre de versions de `sales_transactions` | |
| La franchise au plus gros chiffre d'affaires | |
| La franchise qui a le plus de transactions | |
| Qui refuse l'écriture dans `samples` | |
| Les lignes lues par la seconde exécution, et pourquoi | |

**Dans le chat**, en fin de TP : la franchise au plus gros chiffre d'affaires, celle qui a le plus
de transactions, et le nombre de lignes lues par la seconde exécution.
