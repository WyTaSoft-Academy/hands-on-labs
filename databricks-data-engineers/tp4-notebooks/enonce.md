# TP 4 : bronze, silver, gold, dans un notebook

**Module 5 · ≈ 2 h, pause comprise · individuel · restitution 15 min**

Ce matin, les données de la Banque Lumen sont entrées dans votre catalog, **telles quelles**, en
bronze. Cet après-midi, vous construisez dans un notebook :

- la couche **silver** : les clients et les transactions débarrassés des défauts relevés au TP 1,
  chaque ligne écartée étant **comptée** ;
- une table de **taux de change**, lue sur une API publique ;
- la couche **gold** : les flux mensuels par agence, en euros.

Puis vous comparez les formats d'écriture, et vous partagez votre notebook.

Remplacez `stagiaire01` par votre compte et `<stockage>` par le nom du storage account.

Repères de temps : étapes 1 et 2 avant la pause (≈ 35 min), étapes 3 à 5 après la pause (≈ 55 min),
étapes 6 et 7 en fin (≈ 15 min).

---

## Étape 1 · Le notebook et ses cellules (≈ 15 min)

1. Démarrez votre cluster `cl-stagiaire01` (*Compute*). Pendant qu'il démarre : *Workspace* → votre
   dossier → *Create* → *Notebook*, nommé `tp4-lumen`, langage **Python**. Attachez-le au cluster.
2. Première cellule, en **Markdown** (`%md`) : un titre et une phrase qui dit ce que fait le
   notebook.
3. Deuxième cellule, en Python : les imports et les variables.
   ```python
   from pyspark.sql import functions as F
   moi = "stagiaire01"
   stockage = "<stockage>"
   catalog = f"lumen_{moi}"
   spark.sql(f"USE CATALOG {catalog}")
   ```
4. Une cellule `%sql` : le nombre d'opérations par `devise` dans `bronze.transactions`. Ajoutez une
   **visualisation** en barres sous le résultat.
5. Une cellule Python : `display(spark.table("bronze.clients"))`, puis le **Data profile** du
   résultat. Combien de valeurs nulles dans `email` ? Quelles valeurs prend `segment` ?

## Étape 2 · `silver.clients`, en PySpark (≈ 20 min)

À partir de `bronze.clients`, écrivez `silver.clients` (une managed table, mode `overwrite`) :

- sans les lignes en double ;
- avec le `nom` sans espaces autour et en majuscules ;
- avec `date_naissance` et `date_entree` en vrai type `DATE` ;
- sans la colonne technique `_rescued_data`.

Avant d'écrire, comptez : combien de lignes, et combien de noms ont été **corrigés** parmi les 50
clients dédoublonnés (comparez le nom avant et après, une fois les doublons retirés) ? Les e-mails manquants restent nuls : un e-mail absent n'est pas une erreur
de format, c'est une information.

## Étape 3 · `silver.transactions` et ses rejets, en SQL (≈ 20 min)

Dans des cellules `%sql` :

1. Une vue temporaire `qualif` : les transactions de `bronze.transactions` **sans doublons**
   (les doublons sont des lignes identiques), avec une colonne `rejet` qui vaut, dans cet ordre :
   - `'date_future'` si l'opération est datée du 1<sup>er</sup> juillet 2026 ou après ;
   - `'compte_inconnu'` si son `compte_id` n'est pas dans `bronze.comptes` ;
   - `'montant_nul'` si son montant est 0 ;
   - `NULL` sinon.
2. `silver.transactions` : les lignes sans rejet, avec les 11 colonnes de la bronze (**sans** la
   colonne `rejet`, ni `_rescued_data` si `read_files` l'a ajoutée au TP 3), et `horodatage` en
   `TIMESTAMP` (`CAST`) : le `MERGE` du TP 5 compte sur ce type. Indice : `SELECT * EXCEPT (rejet)`
   reprend toutes les colonnes de la vue, sauf `rejet`.
3. `silver.transactions_rejets` : les lignes rejetées, **avec** la colonne `rejet`.
4. Le nombre de rejets par raison, et le nombre de lignes de `silver.transactions`. Vérifiez que
   bronze = silver + rejets + doublons.

## Étape 4 · L'API des taux de change (≈ 15 min)

L'API [Frankfurter](https://frankfurter.dev) publie les taux de référence de la BCE, sans clé.
Les taux de l'euro en dollar, livre et franc suisse, du 1<sup>er</sup> janvier au 30 juin 2026 :

```
https://api.frankfurter.dev/v1/2026-01-01..2026-06-30?base=EUR&symbols=USD,GBP,CHF
```

1. Appelez l'API en Python avec `requests` (`timeout`, `raise_for_status()`), et regardez la
   structure de la réponse.
2. Aplatissez-la en lignes `(jour, devise, taux)`, faites-en un DataFrame, convertissez `jour` en
   `DATE`, et écrivez `bronze.taux_change`.
3. Combien de lignes ? Quelle est la **première date** ? Pourquoi n'est-ce pas le 1<sup>er</sup>
   janvier ?

**Si l'API ne répond pas** depuis le cluster (réseau du client), une copie de secours contient la même
réponse dans ADLS. Remplacez l'appel par :

```python
import json
texte = spark.read.text(
    f"abfss://formation@{stockage}.dfs.core.windows.net/banque/secours/taux_eur_2026S1.json",
    wholetext=True).first()[0]
reponse = json.loads(texte)
```

## Étape 5 · `gold.flux_mensuels` (≈ 20 min)

Une ligne par **agence** et par **mois** (2026-01 à 2026-06), avec :

- `operations` : le nombre d'opérations ;
- `montant_net_eur` : la somme des montants **en euros**, arrondie au centime.

Les montants en devise se convertissent avec le **taux moyen du mois** de leur devise. Un taux est
le nombre d'unités de devise pour **1 euro** : multiplier ou diviser ? Ne gardez que les taux de
2026.

Le chemin : `silver.transactions` → `bronze.comptes` (le client du compte) → `silver.clients`
(l'agence du client).

Puis :

1. Combien de lignes dans la gold ? Combien d'opérations en tout ? Comparez avec
   `silver.transactions` : où sont passées les autres ?
2. Une visualisation : les opérations par mois, toutes agences confondues.
3. Quelle agence a le plus d'opérations sur le semestre ?

## Étape 6 · Les formats (≈ 10 min)

1. Créez le volume `bronze.depots` s'il n'existe pas (`CREATE VOLUME IF NOT EXISTS`). Écrivez
   `silver.transactions` en **Parquet** dans `/Volumes/lumen_stagiaire01/bronze/depots/export_parquet`,
   puis listez le dossier (`dbutils.fs.ls`). Y a-t-il un `_delta_log` ?
2. Écrivez `gold.flux_mensuels` en **external table** `gold.flux_mensuels_ext`, à l'emplacement
   `abfss://formation@<stockage>.dfs.core.windows.net/externe/stagiaire01/flux_mensuels`. Listez
   l'emplacement. `DESCRIBE EXTENDED` : quel type ?
3. `DROP TABLE gold.flux_mensuels_ext`, puis listez de nouveau l'emplacement. Que reste-t-il ?

## Étape 7 · Partager, exporter (≈ 5 min)

1. *Run* → *Clear state and run all* : le notebook passe-t-il d'un bout à l'autre ?
2. *Share* : donnez `CAN READ` à votre binôme. Il ouvre votre notebook : que voit-il ? Peut-il
   l'exécuter ?
3. *File* → *Export* → *IPython Notebook* : ouvrez le fichier téléchargé dans un éditeur de texte.

## Bonus

1. **`%run`.** Créez un notebook `parametres` qui ne contient que la cellule des variables de
   l'étape 1. Remplacez cette cellule de `tp4-lumen` par `%run ./parametres`.
2. **`DESCRIBE HISTORY`** sur `silver.transactions`, puis réexécutez l'étape 3 et regardez de
   nouveau. Que voyez-vous ? (C'est le sujet de demain matin.)

---

## Ce qu'on attend en fin de TP

| Mesure | Votre résultat |
|---|---|
| `silver.clients` : lignes / noms corrigés | |
| Transactions après dédoublonnage | |
| Rejets : `date_future` / `compte_inconnu` / `montant_nul` | |
| `silver.transactions` : lignes | |
| `bronze.taux_change` : lignes / première date | |
| `gold.flux_mensuels` : lignes / opérations | |
| Opérations « perdues » entre silver et gold, et pourquoi | |
| Ce qui reste après le `DROP` de l'external table | |

Ne supprimez pas vos tables : la pratique du module 6 et le TP 5 partent de `silver.transactions`.
