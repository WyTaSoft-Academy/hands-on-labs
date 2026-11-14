# Pratique guidée du module 6 : casser, réparer, fusionner

**Module 6 · ≈ 25 min · ensemble, chacun sur ses tables · pas de restitution séparée**

Le programme ne prévoit pas de TP pour « Principe de Spark et Delta ». Cette pratique le remplace :
le formateur projette et fait en même temps que la salle. Elle part des tables du TP 4, et les
laisse **dans le même état** à la fin : le TP 5 en part.

Dans un nouveau notebook `pratique-module6`, en Python, attaché à `cl-stagiaire01`. Première
cellule :

```python
moi = "stagiaire01"
stockage = "<stockage>"
spark.sql(f"USE CATALOG lumen_{moi}")
```

Remplacez `stagiaire01` par votre compte et `<stockage>` par le nom du storage account : l'étape 6
s'en sert. Toutes les autres cellules sont en `%sql`, sauf l'étape 6.

---

## 1 · L'historique

```sql
DESCRIBE HISTORY silver.transactions;
```

Combien de versions ? Quelle `operation` pour chacune ? Relevez le numéro de la **dernière**
version : c'est `<v>`.

## 2 · La fausse manœuvre

La Banque Lumen demande de retirer de la silver les **frais de janvier**, facturés par erreur.
Quelqu'un écrit, trop vite :

```sql
DELETE FROM silver.transactions WHERE type_operation = 'FRAIS';
```

Lisez le résultat de la commande : combien de lignes supprimées ? Comptez la table.

## 3 · Le time travel

1. Comptez la table **à la version `<v>`** (`VERSION AS OF`).
2. À cette version, combien y avait-il de frais **de janvier** seulement ? Combien la fausse
   manœuvre en a-t-elle supprimé en trop ?
3. `DESCRIBE HISTORY` : que dit la ligne du `DELETE` (`operationMetrics`) ?

## 4 · `RESTORE`

```sql
RESTORE TABLE silver.transactions TO VERSION AS OF <v>;
```

Comptez la table. Puis `DESCRIBE HISTORY` : la version du `DELETE` a-t-elle disparu ?

*(La bonne commande aurait été le `DELETE` avec `AND horodatage < '2026-02-01'`. On ne la lance
pas : la silver doit rester intacte pour le TP 5.)*

## 5 · Un `MERGE` sur une copie

1. Une copie des clients, pour essayer sans risque :
   ```sql
   CREATE OR REPLACE TABLE silver.clients_essai DEEP CLONE silver.clients;
   ```
2. Les corrections du jour : deux clients passent en segment patrimonial, un client arrive.
   ```sql
   CREATE OR REPLACE TEMP VIEW corrections AS
   SELECT * FROM VALUES
     ('CLI000001', 'MOREL',   'Louise', 'PATRIMONIAL', 'AG01'),
     ('CLI000002', 'SILVA',   'Alice',  'PATRIMONIAL', 'AG02'),
     ('CLI000051', 'NOUVEAU', 'Client', 'PARTICULIER', 'AG11')
     AS v(client_id, nom, prenom, segment, agence_id);
   ```
3. Écrivez le `MERGE` : mettre à jour le segment des clients existants **s'il a changé**, insérer
   les nouveaux. Lisez ses métriques (lignes mises à jour, insérées).
4. **Relancez** exactement le même `MERGE`. Que disent les métriques ?
5. Comptez `silver.clients_essai`, et le nombre de clients `PATRIMONIAL`. Comparez avec
   `silver.clients`.

## 6 · Le journal à l'œil nu

Hier, vous avez supprimé l'external table `gold.flux_mensuels_ext` ; ses fichiers sont restés.
En Python, avec les variables `moi` et `stockage` de la première cellule :

```python
log = f"abfss://formation@{stockage}.dfs.core.windows.net/externe/{moi}/flux_mensuels/_delta_log/"
display(dbutils.fs.ls(log))
```

Puis lisez le premier commit comme un fichier JSON :

```python
premier = spark.read.json(log + "00000000000000000000.json")
display(premier)
print(premier.filter("add IS NOT NULL").count())
```

Quelles sortes de lignes contient-il ? Combien de lignes `add`, c'est-à-dire de fichiers Parquet ?

## 7 · Le plan (si le temps le permet)

```sql
EXPLAIN SELECT devise, COUNT(*) FROM silver.transactions GROUP BY devise;
```

Repérez l'`Exchange`. Puis exécutez la requête elle-même, et ouvrez la Spark UI du job : combien
de stages ?

## Pour finir

```sql
DROP TABLE silver.clients_essai;
SELECT COUNT(*) FROM silver.transactions;   -- doit valoir 3 200
```

## Si le temps le permet

```sql
DESCRIBE DETAIL silver.transactions;         -- numFiles, sizeInBytes
OPTIMIZE silver.transactions;
DESCRIBE DETAIL silver.transactions;
VACUUM silver.transactions DRY RUN;
```
