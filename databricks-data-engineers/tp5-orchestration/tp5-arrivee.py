# Databricks notebook source
# MAGIC %md
# MAGIC # TP 5 : tp5-arrivee (corrigé)
# MAGIC
# MAGIC Applique une arrivée quotidienne de la Banque Lumen (fictive) à `silver.transactions` par
# MAGIC `MERGE`. Paramétré par trois widgets, remplis à la main, par un job ou par Azure Data
# MAGIC Factory (`baseParameters`). Idempotent : rejoué sur un jour déjà traité, il ne change rien.
# MAGIC
# MAGIC Chiffres : fichier des résultats attendus, section `tp5`. **Exécuté le 13/11/2026** sur la plateforme de la formation : chiffres conformes.

# COMMAND ----------

dbutils.widgets.text("catalog", "lumen_stagiaire01")
dbutils.widgets.text("jour", "2026-07-01")
dbutils.widgets.text("stockage", "<stockage>")

catalog = dbutils.widgets.get("catalog")
jour = dbutils.widgets.get("jour")
stockage = dbutils.widgets.get("stockage")
spark.sql(f"USE CATALOG {catalog}")

chemin = f"abfss://formation@{stockage}.dfs.core.windows.net/banque/arrivees/transactions_{jour}.csv"
print(chemin)

# COMMAND ----------

# Les 11 colonnes de silver.transactions, avec les mêmes noms et les mêmes types : INSERT * du
# MERGE associe les colonnes par leur nom. Un fichier absent fait échouer cette cellule, et donc la tâche.
arrivee = spark.sql(f"""
  SELECT transaction_id, compte_id,
         CAST(horodatage AS TIMESTAMP) AS horodatage,
         CAST(montant AS DOUBLE)       AS montant,
         devise, type_operation, libelle, categorie, pays, canal, statut
  FROM read_files('{chemin}', format => 'csv', header => true)""")
arrivee.createOrReplaceTempView("arrivee")

display(spark.sql("SELECT statut, COUNT(*) AS lignes FROM arrivee GROUP BY statut"))
# 2026-07-01 : VALIDEE 21, ANNULEE 4 (25 lignes)
# 2026-07-02 : VALIDEE 24, ANNULEE 4 (28 lignes)
# 2026-07-03 : VALIDEE 20, ANNULEE 4 (24 lignes)

# COMMAND ----------

r = spark.sql("""
  MERGE INTO silver.transactions AS c
  USING arrivee AS s
  ON c.transaction_id = s.transaction_id
  WHEN MATCHED AND s.statut = 'ANNULEE' AND c.statut <> 'ANNULEE' THEN
    UPDATE SET c.statut = 'ANNULEE'
  WHEN NOT MATCHED AND s.statut = 'VALIDEE' THEN
    INSERT *
""").first()

n_maj, n_ins = r["num_updated_rows"], r["num_inserted_rows"]
print(f"{jour} : {n_maj} mises à jour, {n_ins} insertions")
# 1er juillet : 4 · 21 → silver 3221
# 2 juillet   : 4 · 24 → silver 3245
# 3 juillet   : 4 · 20 → silver 3265
# Rejeu d'un jour déjà traité : 0 · 0 (les annulations sont déjà ANNULEE, les nouvelles existent)

# COMMAND ----------

import json

dbutils.jobs.taskValues.set(key="insertions", value=n_ins)   # bonus 1 ; sans effet hors d'un job
dbutils.notebook.exit(json.dumps({"jour": jour, "mises_a_jour": n_maj, "insertions": n_ins}))
