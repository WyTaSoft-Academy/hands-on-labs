# Databricks notebook source
# MAGIC %md
# MAGIC # TP 4 : corrigé
# MAGIC
# MAGIC Banque Lumen (fictive) : bronze → silver → gold. Notebook au format source Databricks :
# MAGIC *Workspace* → *Import*, puis l'attacher à `cl-stagiaire01`.
# MAGIC
# MAGIC Les chiffres viennent du fichier des résultats attendus, section `tp4`, recalculés avec pandas
# MAGIC sur les fichiers générés et les taux de l'API relevés le 05/11/2026. **Exécuté le 13/11/2026**
# MAGIC sur la plateforme de la formation (cluster `dki-stagiaire`, runtime 18 LTS) : 18 cellules sur 18, tous
# MAGIC les chiffres conformes, API Frankfurter joignable depuis le cluster.

# COMMAND ----------

# MAGIC %md
# MAGIC ## Étape 1 : le notebook et ses cellules

# COMMAND ----------

from pyspark.sql import functions as F

moi = "stagiaire01"
stockage = "<stockage>"
catalog = f"lumen_{moi}"
spark.sql(f"USE CATALOG {catalog}")

# COMMAND ----------

# MAGIC %sql
# MAGIC -- Visualisation : + → Visualization → Bar, devise en X, operations en Y
# MAGIC SELECT devise, COUNT(*) AS operations
# MAGIC FROM bronze.transactions
# MAGIC GROUP BY devise
# MAGIC ORDER BY operations DESC
# MAGIC -- EUR 3180, CHF 18, USD 9, GBP 7 (comme au TP 1 : la bronze est le fichier)

# COMMAND ----------

display(spark.table("bronze.clients"))
# Data profile : email, 3 nuls. segment : PARTICULIER, PROFESSIONNEL, PATRIMONIAL.

# COMMAND ----------

# MAGIC %md
# MAGIC ## Étape 2 : silver.clients

# COMMAND ----------

bronze_clients = spark.table("bronze.clients").drop("_rescued_data").dropDuplicates()

silver_clients = (bronze_clients
    .withColumn("nom", F.upper(F.trim("nom")))
    .withColumn("date_naissance", F.to_date("date_naissance", "dd/MM/yyyy"))
    .withColumn("date_entree", F.to_date("date_entree", "dd/MM/yyyy")))

print(silver_clients.count())  # 50
noms_corriges = bronze_clients.filter(F.col("nom") != F.upper(F.trim("nom"))).count()
print(noms_corriges)  # 4, parmi les 50 clients dédoublonnés
# 5 si l'on compte sur bronze.clients avant dropDuplicates : le nom mal saisi de CLI000019
# ("  gauthier ") est sur une des deux lignes en double.

silver_clients.write.mode("overwrite").option("overwriteSchema", True).saveAsTable("silver.clients")

# COMMAND ----------

# MAGIC %md
# MAGIC ## Étape 3 : silver.transactions et ses rejets

# COMMAND ----------

# MAGIC %sql
# MAGIC CREATE OR REPLACE TEMP VIEW qualif AS
# MAGIC SELECT t.transaction_id, t.compte_id, CAST(t.horodatage AS TIMESTAMP) AS horodatage, t.montant, t.devise,
# MAGIC        t.type_operation, t.libelle, t.categorie, t.pays, t.canal, t.statut,
# MAGIC        CASE
# MAGIC          WHEN t.horodatage >= '2026-07-01' THEN 'date_future'
# MAGIC          WHEN c.compte_id IS NULL          THEN 'compte_inconnu'
# MAGIC          WHEN t.montant = 0                THEN 'montant_nul'
# MAGIC        END AS rejet
# MAGIC FROM (SELECT DISTINCT transaction_id, compte_id, horodatage, montant, devise,
# MAGIC                       type_operation, libelle, categorie, pays, canal, statut
# MAGIC       FROM bronze.transactions) AS t
# MAGIC LEFT JOIN bronze.comptes AS c ON t.compte_id = c.compte_id

# COMMAND ----------

# MAGIC %sql
# MAGIC CREATE OR REPLACE TABLE silver.transactions
# MAGIC   COMMENT 'Transactions sans doublons ni rejets'
# MAGIC AS SELECT * EXCEPT (rejet) FROM qualif WHERE rejet IS NULL;
# MAGIC
# MAGIC CREATE OR REPLACE TABLE silver.transactions_rejets
# MAGIC   COMMENT 'Transactions écartées de la silver, avec leur raison'
# MAGIC AS SELECT * FROM qualif WHERE rejet IS NOT NULL;

# COMMAND ----------

# MAGIC %sql
# MAGIC SELECT rejet, COUNT(*) AS lignes FROM silver.transactions_rejets GROUP BY rejet ORDER BY rejet
# MAGIC -- compte_inconnu 3, date_future 2, montant_nul 4

# COMMAND ----------

# MAGIC %sql
# MAGIC SELECT (SELECT COUNT(*) FROM bronze.transactions)           AS bronze,      -- 3214
# MAGIC        (SELECT COUNT(*) FROM qualif)                         AS dedoublonne, -- 3209 : 5 doublons
# MAGIC        (SELECT COUNT(*) FROM silver.transactions)            AS silver,      -- 3200
# MAGIC        (SELECT COUNT(*) FROM silver.transactions_rejets)     AS rejets       -- 9
# MAGIC -- 3214 = 3200 + 9 + 5

# COMMAND ----------

# MAGIC %md
# MAGIC ## Étape 4 : l'API des taux de change

# COMMAND ----------

import requests

r = requests.get(
    "https://api.frankfurter.dev/v1/2026-01-01..2026-06-30",
    params={"base": "EUR", "symbols": "USD,GBP,CHF"},
    timeout=30)
r.raise_for_status()
reponse = r.json()
# {"amount": 1.0, "base": "EUR", "start_date": "2025-12-31", "end_date": "2026-06-30",
#  "rates": {"2025-12-31": {"CHF": 0.9314, "GBP": 0.8726, "USD": 1.175}, ...}}

# Secours, si l'API est injoignable depuis le cluster :
# import json
# texte = spark.read.text(f"abfss://formation@{stockage}.dfs.core.windows.net/banque/secours/taux_eur_2026S1.json",
#                         wholetext=True).first()[0]
# reponse = json.loads(texte)

# COMMAND ----------

lignes = [(jour, devise, float(taux))
          for jour, taux_du_jour in reponse["rates"].items()
          for devise, taux in taux_du_jour.items()]

taux_change = (spark.createDataFrame(lignes, "jour STRING, devise STRING, taux DOUBLE")
                    .withColumn("jour", F.to_date("jour")))
taux_change.write.mode("overwrite").saveAsTable("bronze.taux_change")

print(taux_change.count())                       # 378 : 126 jours × 3 devises
print(taux_change.agg(F.min("jour")).first()[0])  # 2025-12-31
# Le 1er janvier est férié (pas de taux BCE) : l'API rend le dernier taux connu avant la date de
# début. 125 jours de cotation en 2026.

# COMMAND ----------

# MAGIC %md
# MAGIC ## Étape 5 : gold.flux_mensuels

# COMMAND ----------

# MAGIC %sql
# MAGIC CREATE OR REPLACE TABLE gold.flux_mensuels
# MAGIC   COMMENT 'Opérations et montant net en euros, par agence et par mois'
# MAGIC AS
# MAGIC WITH taux_mois AS (
# MAGIC   SELECT date_trunc('MONTH', jour) AS mois, devise, AVG(taux) AS taux
# MAGIC   FROM bronze.taux_change
# MAGIC   WHERE jour >= '2026-01-01'
# MAGIC   GROUP BY ALL
# MAGIC )
# MAGIC SELECT cl.agence_id,
# MAGIC        CAST(date_trunc('MONTH', t.horodatage) AS DATE) AS mois,
# MAGIC        COUNT(*) AS operations,
# MAGIC        ROUND(SUM(CASE WHEN t.devise = 'EUR' THEN t.montant ELSE t.montant / tm.taux END), 2)
# MAGIC          AS montant_net_eur
# MAGIC FROM silver.transactions AS t
# MAGIC JOIN bronze.comptes AS co ON t.compte_id = co.compte_id
# MAGIC JOIN silver.clients AS cl ON co.client_id = cl.client_id
# MAGIC LEFT JOIN taux_mois AS tm
# MAGIC   ON tm.devise = t.devise AND tm.mois = date_trunc('MONTH', t.horodatage)
# MAGIC GROUP BY ALL

# COMMAND ----------

# MAGIC %sql
# MAGIC SELECT COUNT(*) AS lignes,                     -- 144 : 24 agences × 6 mois
# MAGIC        SUM(operations) AS operations,          -- 3103
# MAGIC        ROUND(SUM(montant_net_eur)) AS net_eur  -- ≈ 1189951 (à quelques euros près, arrondis)
# MAGIC FROM gold.flux_mensuels
# MAGIC -- 3200 en silver, 3103 en gold : 97 opérations perdues. Ce sont celles des 2 comptes dont
# MAGIC -- le client n'existe pas (TP 1) : la jointure avec silver.clients les écarte sans le dire.

# COMMAND ----------

# MAGIC %sql
# MAGIC -- Visualisation : ligne ou barres, mois en X, operations en Y
# MAGIC SELECT mois, SUM(operations) AS operations FROM gold.flux_mensuels GROUP BY mois ORDER BY mois
# MAGIC -- 2026-01 529, 02 521, 03 521, 04 506, 05 505, 06 521

# COMMAND ----------

# MAGIC %sql
# MAGIC SELECT agence_id, SUM(operations) AS operations
# MAGIC FROM gold.flux_mensuels GROUP BY agence_id ORDER BY operations DESC LIMIT 3
# MAGIC -- AG18 (Angers) en tête : 333 opérations

# COMMAND ----------

# MAGIC %md
# MAGIC ## Étape 6 : les formats

# COMMAND ----------

spark.sql("CREATE VOLUME IF NOT EXISTS bronze.depots")

export = f"/Volumes/{catalog}/bronze/depots/export_parquet"
spark.table("silver.transactions").write.mode("overwrite").parquet(export)
display(dbutils.fs.ls(export))
# Des fichiers part-….parquet et des fichiers techniques (_SUCCESS, _committed_…, _started_…).
# Pas de _delta_log : c'est du Parquet seul, sans journal ni historique.

# COMMAND ----------

emplacement = f"abfss://formation@{stockage}.dfs.core.windows.net/externe/{moi}/flux_mensuels"
(spark.table("gold.flux_mensuels")
      .write.mode("overwrite")
      .option("path", emplacement)
      .saveAsTable("gold.flux_mensuels_ext"))
display(dbutils.fs.ls(emplacement))
# _delta_log/ et des fichiers part-….parquet : une table Delta, dont les fichiers sont chez vous.

# COMMAND ----------

# MAGIC %sql
# MAGIC DESCRIBE EXTENDED gold.flux_mensuels_ext
# MAGIC -- Type : EXTERNAL ; Location : abfss://formation@…/externe/stagiaire01/flux_mensuels

# COMMAND ----------

spark.sql("DROP TABLE gold.flux_mensuels_ext")
display(dbutils.fs.ls(emplacement))
# Tout est encore là, _delta_log compris : DROP n'a supprimé que la déclaration dans le catalog.
# On pourrait redéclarer la table : CREATE TABLE gold.flux_mensuels_ext LOCATION '…'.

# COMMAND ----------

# MAGIC %md
# MAGIC ## Étape 7 : partager, exporter
# MAGIC
# MAGIC 1. *Clear state and run all* : le notebook passe si aucune cellule ne dépend d'une exécution
# MAGIC    manuelle. Le piège classique : une variable définie dans une cellule supprimée depuis.
# MAGIC 2. En `CAN READ`, le binôme voit le code **et les résultats affichés**, y compris les lignes de
# MAGIC    `bronze.clients` du `display` de l'étape 1, alors qu'il n'a aucun privilege sur cette table.
# MAGIC    Il ne peut pas exécuter (il faudrait `CAN RUN`, et un compute, et les privileges).
# MAGIC 3. Le `.ipynb` est du JSON : les cellules, leur langage (métadonnées), et les résultats.

# COMMAND ----------

# MAGIC %md
# MAGIC ## Bonus
# MAGIC
# MAGIC 1. `%run ./parametres` exécute le notebook `parametres` dans la même session : `moi`,
# MAGIC    `catalog` et `F` deviennent disponibles. `%run` doit être seul dans sa cellule.
# MAGIC 2. `DESCRIBE HISTORY silver.transactions` : une version par `CREATE OR REPLACE TABLE`. Après
# MAGIC    réexécution, une version de plus : l'ancienne reste lisible (`VERSION AS OF`). Module 6.
