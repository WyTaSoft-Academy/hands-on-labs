# Databricks notebook source
# MAGIC %md
# MAGIC # Pratique guidée du module 6 : corrigé
# MAGIC
# MAGIC À importer, puis attacher à `cl-stagiaire01`, **après** le corrigé du TP 4. Chiffres tirés
# MAGIC du fichier des résultats attendus, section `module6`. **Exécuté le 13/11/2026** sur la
# MAGIC plateforme de la formation : 17 cellules sur 17, tous les chiffres conformes. La table `silver.transactions` doit valoir 3 200 lignes au début et à
# MAGIC la fin.

# COMMAND ----------

moi = "stagiaire01"
stockage = "<stockage>"
spark.sql(f"USE CATALOG lumen_{moi}")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 1 · L'historique

# COMMAND ----------

# MAGIC %sql
# MAGIC DESCRIBE HISTORY silver.transactions
# MAGIC -- Au moins une version, operation CREATE OR REPLACE TABLE AS SELECT : une par exécution de
# MAGIC -- l'étape 3 du TP 4. La dernière version est <v>.

# COMMAND ----------

v = spark.sql("DESCRIBE HISTORY silver.transactions").agg({"version": "max"}).first()[0]
print(v)

# COMMAND ----------

# MAGIC %md
# MAGIC ## 2 · La fausse manœuvre

# COMMAND ----------

# MAGIC %sql
# MAGIC DELETE FROM silver.transactions WHERE type_operation = 'FRAIS'
# MAGIC -- num_affected_rows = 20 : tous les frais du semestre, au lieu des seuls frais de janvier

# COMMAND ----------

# MAGIC %sql
# MAGIC SELECT COUNT(*) FROM silver.transactions   -- 3180

# COMMAND ----------

# MAGIC %md
# MAGIC ## 3 · Le time travel

# COMMAND ----------

display(spark.sql(f"SELECT COUNT(*) AS lignes FROM silver.transactions VERSION AS OF {v}"))  # 3200

display(spark.sql(f"""
  SELECT COUNT(*) AS frais_janvier            -- 4 : les seuls visés ; 16 supprimés en trop
  FROM silver.transactions VERSION AS OF {v}
  WHERE type_operation = 'FRAIS' AND horodatage < '2026-02-01'"""))

# DESCRIBE HISTORY : une version v+1, operation DELETE, operationMetrics.numDeletedRows = 20
# (et numDeletionVectorsAdded si les deletion vectors sont actifs).

# COMMAND ----------

# MAGIC %md
# MAGIC ## 4 · RESTORE

# COMMAND ----------

spark.sql(f"RESTORE TABLE silver.transactions TO VERSION AS OF {v}")
print(spark.table("silver.transactions").count())   # 3200

# COMMAND ----------

# MAGIC %sql
# MAGIC DESCRIBE HISTORY silver.transactions
# MAGIC -- Le DELETE est toujours là (v+1), suivi d'un RESTORE (v+2). L'historique garde l'erreur et
# MAGIC -- sa réparation : rien n'a été effacé.

# COMMAND ----------

# MAGIC %md
# MAGIC ## 5 · Un MERGE sur une copie

# COMMAND ----------

# MAGIC %sql
# MAGIC CREATE OR REPLACE TABLE silver.clients_essai DEEP CLONE silver.clients;
# MAGIC
# MAGIC CREATE OR REPLACE TEMP VIEW corrections AS
# MAGIC SELECT * FROM VALUES
# MAGIC   ('CLI000001', 'MOREL',   'Louise', 'PATRIMONIAL', 'AG01'),
# MAGIC   ('CLI000002', 'SILVA',   'Alice',  'PATRIMONIAL', 'AG02'),
# MAGIC   ('CLI000051', 'NOUVEAU', 'Client', 'PARTICULIER', 'AG11')
# MAGIC   AS v(client_id, nom, prenom, segment, agence_id);

# COMMAND ----------

# MAGIC %sql
# MAGIC MERGE INTO silver.clients_essai AS c
# MAGIC USING corrections AS s
# MAGIC ON c.client_id = s.client_id
# MAGIC WHEN MATCHED AND c.segment <> s.segment THEN
# MAGIC   UPDATE SET segment = s.segment
# MAGIC WHEN NOT MATCHED THEN
# MAGIC   INSERT (client_id, nom, prenom, segment, agence_id)
# MAGIC   VALUES (s.client_id, s.nom, s.prenom, s.segment, s.agence_id)
# MAGIC -- num_updated_rows = 2 (CLI000001 et CLI000002 étaient PARTICULIER), num_inserted_rows = 1

# COMMAND ----------

# MAGIC %sql
# MAGIC -- Le même MERGE, relancé : 0 mise à jour, 0 insertion. La condition AND c.segment <> s.segment
# MAGIC -- rend le traitement idempotent. Sans elle : 2 mises à jour à chaque passage (mêmes valeurs,
# MAGIC -- fichiers réécrits quand même).
# MAGIC MERGE INTO silver.clients_essai AS c
# MAGIC USING corrections AS s
# MAGIC ON c.client_id = s.client_id
# MAGIC WHEN MATCHED AND c.segment <> s.segment THEN
# MAGIC   UPDATE SET segment = s.segment
# MAGIC WHEN NOT MATCHED THEN
# MAGIC   INSERT (client_id, nom, prenom, segment, agence_id)
# MAGIC   VALUES (s.client_id, s.nom, s.prenom, s.segment, s.agence_id)

# COMMAND ----------

# MAGIC %sql
# MAGIC SELECT (SELECT COUNT(*) FROM silver.clients_essai)                             AS essai,        -- 51
# MAGIC        (SELECT COUNT_IF(segment = 'PATRIMONIAL') FROM silver.clients_essai)    AS patri_essai,  -- 9
# MAGIC        (SELECT COUNT(*) FROM silver.clients)                                   AS origine,      -- 50
# MAGIC        (SELECT COUNT_IF(segment = 'PATRIMONIAL') FROM silver.clients)          AS patri_origine -- 7
# MAGIC -- La copie a changé, l'original non.

# COMMAND ----------

# MAGIC %md
# MAGIC ## 6 · Le journal à l'œil nu

# COMMAND ----------

log = f"abfss://formation@{stockage}.dfs.core.windows.net/externe/{moi}/flux_mensuels/_delta_log/"
display(dbutils.fs.ls(log))
# 00000000000000000000.json (et .crc). Une version par exécution de l'étape 6 du TP 4 : au moins deux si vous avez fait
# « Clear state and run all » à l'étape 7. Lire la plus ancienne, …000.json.

# COMMAND ----------

premier = spark.read.json(log + "00000000000000000000.json")
display(premier)
# Une ligne par action : commitInfo (operation, userName…), metaData (schema, partitionColumns),
# protocol (versions du lecteur et de l'écrivain), et une ligne add par fichier Parquet.
print(premier.filter("add IS NOT NULL").count())
# Le nombre de fichiers : petit (la gold fait 144 lignes), souvent 1. À relever à la répétition.

# COMMAND ----------

# MAGIC %md
# MAGIC ## 7 · Le plan

# COMMAND ----------

# MAGIC %sql
# MAGIC EXPLAIN SELECT devise, COUNT(*) FROM silver.transactions GROUP BY devise
# MAGIC -- AdaptiveSparkPlan > HashAggregate > Exchange hashpartitioning(devise, …) > HashAggregate
# MAGIC -- (partial_count) > Scan. L'Exchange est le shuffle.

# COMMAND ----------

# MAGIC %sql
# MAGIC SELECT devise, COUNT(*) AS operations FROM silver.transactions GROUP BY devise
# MAGIC -- EUR 3166, CHF 18, GBP 7, USD 9. Spark UI : deux stages, séparés par le shuffle
# MAGIC -- (l'AQE peut en montrer un troisième, sauté, ou fusionner les partitions après l'échange).

# COMMAND ----------

# MAGIC %md
# MAGIC ## Pour finir

# COMMAND ----------

# MAGIC %sql
# MAGIC DROP TABLE silver.clients_essai;
# MAGIC SELECT COUNT(*) FROM silver.transactions   -- 3200 : le TP 5 peut partir

# COMMAND ----------

# MAGIC %md
# MAGIC ## Si le temps le permet
# MAGIC
# MAGIC `DESCRIBE DETAIL` donne `numFiles` avant et après `OPTIMIZE` (la table du TP 4, écrite d'un
# MAGIC coup, a déjà peu de fichiers : le gain est faible ici, et c'est la leçon). `VACUUM … DRY RUN`
# MAGIC liste les fichiers qui seraient effacés : aucun avant 7 jours de rétention.
