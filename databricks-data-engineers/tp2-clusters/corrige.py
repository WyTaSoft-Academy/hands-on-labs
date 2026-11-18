# Databricks notebook source
# MAGIC %md
# MAGIC # TP 2 : corrigé
# MAGIC
# MAGIC Notebook au format source Databricks : *Workspace* → *Import* → ce fichier. À attacher au
# MAGIC cluster `cl-stagiaire01` (single node, policy `dki-stagiaire`).
# MAGIC
# MAGIC Les chiffres viennent du fichier des résultats attendus (section `transactions`). Réponses sur
# MAGIC l'interface relevées le **13/11/2026** sur la plateforme de la formation (création de `cl-formateur`
# MAGIC sous `dki-stagiaire`, runtime 18 LTS). Ce qui n'a pas été observé est marqué « à relever ».

# COMMAND ----------

# MAGIC %md
# MAGIC ## Étape 1 : créer son cluster
# MAGIC
# MAGIC 1. Le formulaire (« Simple form ») ne montre que : *Compute name*, *Policy*, *Machine
# MAGIC    learning*, *Databricks runtime*, *Photon acceleration*, *Preferred node type*, *Terminate
# MAGIC    after*, *Tags*, et *Advanced* replié. Absents : le nombre de workers et l'autoscaling, le
# MAGIC    choix single node / multi node, le type du driver, la Spark config, la disponibilité (à la
# MAGIC    demande ou spot). La policy les **fixe** : le cluster est single node (`num_workers` = 0,
# MAGIC    `spark.master` = `local[*, 4]`), driver et worker en `Standard_D4ds_v5`. L'access mode est
# MAGIC    fixé lui aussi (`SINGLE_USER`, c'est-à-dire Dedicated).
# MAGIC 2. Le récapitulatif affiche **16 GB Memory, 4 Cores** et **2 DBU/h**, Photon coché (c'est la
# MAGIC    valeur par défaut : la policy ne le fixe pas). Sans Photon : à relever (moins de DBU/h).
# MAGIC 3. Impossible : le champ *Terminate after* est **verrouillé** à 20 (icône de cadenas), car la
# MAGIC    policy fixe `autotermination_minutes` à 20. On ne peut ni l'allonger ni le raccourcir.

# COMMAND ----------

# MAGIC %md
# MAGIC ## Étape 2 : les types de compute
# MAGIC
# MAGIC 1. Onglets relevés le 13/11/2026 : *Serverless* (le compute géré par Databricks, pour les
# MAGIC    notebooks et les jobs : « Default Interactive Compute » et « Default Automated Compute »),
# MAGIC    *All-purpose compute* (le travail interactif : vos notebooks), *Job compute* (créé par un job
# MAGIC    pour une exécution), *SQL warehouses* (le SQL, les dashboards, la BI), *Pools* (des VMs gardées
# MAGIC    prêtes), *Policies*. Hors programme : *AI Search*, *Apps*, *Lakebase*.
# MAGIC 2. `wh-dki-formation` : **Serverless**, **2X-Small**, scaling **1 à 2** clusters, auto stop
# MAGIC    **10 min**. Démarré seulement si quelqu'un a lancé une requête dans les dix dernières minutes.
# MAGIC 3. Définition de `dki-stagiaire` (relevée le 13/11/2026). **Fixed** : le profil single node,
# MAGIC    `spark.master` (`local[*, 4]`), `num_workers` (0), `driver_node_type_id`
# MAGIC    (`Standard_D4ds_v5`), `autotermination_minutes` (**20**), `data_security_mode`
# MAGIC    (`SINGLE_USER`), la disponibilité (`ON_DEMAND_AZURE`), le tag `ResourceClass` = `SingleNode`.
# MAGIC    **Allowlist** : `node_type_id`, une seule valeur, `Standard_D4ds_v5`. **Unlimited** :
# MAGIC    `spark_version` (LTS par défaut). Photon n'y figure pas : il reste au choix de l'utilisateur.
# MAGIC 4. Non : le groupe `grp-dki-stagiaires` n'a pas l'entitlement *Unrestricted cluster creation*,
# MAGIC    et *Personal Compute* est réservée aux administrateurs. Seule `dki-stagiaire` est proposée.
# MAGIC    Limite d'un cluster par utilisateur : à relever avec un compte stagiaire.

# COMMAND ----------

# MAGIC %md
# MAGIC ## Étape 3 : un premier notebook

# COMMAND ----------

chemin = "abfss://formation@<stockage>.dfs.core.windows.net/banque/transactions/"
df = spark.read.parquet(chemin)
df.count()  # 3214

# COMMAND ----------

display(df.groupBy("_metadata.file_name").count().orderBy("file_name"))
# 2026-01.parquet 547
# 2026-02.parquet 542
# 2026-03.parquet 539
# 2026-04.parquet 524
# 2026-05.parquet 524
# 2026-06.parquet 538

# COMMAND ----------

# MAGIC %sql
# MAGIC SELECT COUNT(*) AS lignes  -- 3214
# MAGIC FROM read_files(
# MAGIC   'abfss://formation@<stockage>.dfs.core.windows.net/banque/transactions/',
# MAGIC   format => 'parquet')

# COMMAND ----------

# MAGIC %md
# MAGIC 1. Oui, 3 214 lignes, comme au TP 1. Ce qui a changé : le **compute** (votre cluster
# MAGIC    classique au lieu du SQL warehouse serverless) et le langage (Python en plus du SQL). Ce
# MAGIC    qui n'a pas changé : les fichiers, et l'autorisation (`READ FILES` sur l'external location
# MAGIC    `ext_dki_formation`), appliquée par Unity Catalog quel que soit le compute.
# MAGIC 2. Souvent, oui. La première exécution paie le démarrage de la JVM et de Spark, la liste des
# MAGIC    fichiers et la lecture de leurs métadonnées. Les données elles-mêmes ne sont pas gardées en
# MAGIC    mémoire : il faudrait un `cache()` explicite, que l'on ne fait pas ici.

# COMMAND ----------

# MAGIC %md
# MAGIC ## Étape 4 : observer
# MAGIC
# MAGIC 1. Une poignée de tasks (moins de dix) : les six fichiers sont minuscules (≈ 20 Ko chacun,
# MAGIC    ≈ 540 lignes). Le nombre de tasks suit la **taille** des données, pas le nombre de lignes
# MAGIC    (module 6). Le nombre exact dépend du runtime : le relever à la répétition. Le jeu du TP est
# MAGIC    petit exprès : le mécanisme est le même à 260 millions de lignes, avec bien plus de tasks.
# MAGIC 2. **Un** executor, le driver, avec **4 cœurs** : un cluster single node n'a pas de worker, le
# MAGIC    driver exécute les tasks lui-même, jusqu'à quatre à la fois.
# MAGIC 3. Relevé le 13/11/2026 : `CREATING` (« Compute creation requested by … »), `RUNNING`
# MAGIC    (« Compute is running on release 18.3.10 »), `DRIVER_HEALTHY` (« Driver is healthy »).
# MAGIC    Démarrage : **9 min 35 s** entre `CREATING` et `RUNNING`. Un redémarrage prend à peu près
# MAGIC    autant : la VM est rendue à Azure à chaque arrêt.

# COMMAND ----------

# Le nombre de cœurs vu par Spark : 4 (Standard_D4ds_v5, et spark.master = local[*, 4])
spark.sparkContext.defaultParallelism

# COMMAND ----------

# MAGIC %md
# MAGIC ## Étape 5 : arrêter
# MAGIC
# MAGIC - L'Event log montre `TERMINATING`, avec une raison de type **demande de l'utilisateur**
# MAGIC   (`USER_REQUEST`). Après 20 minutes sans activité, la raison aurait été l'inactivité
# MAGIC   (`INACTIVITY`).
# MAGIC - Le notebook garde ses cellules et les **résultats affichés** : ils sont enregistrés avec le
# MAGIC   notebook. La variable `df`, elle, a disparu avec le cluster : au redémarrage, il faut
# MAGIC   réexécuter les cellules.

# COMMAND ----------

# MAGIC %md
# MAGIC ## Bonus
# MAGIC
# MAGIC 1. Sur `wh-dki-formation`, la cellule `%sql` s'exécute ; la cellule Python est refusée : un SQL
# MAGIC    warehouse n'exécute que du SQL.
# MAGIC 2. Le voisin peut **s'attacher**, mais l'exécution est refusée : le cluster est en access mode
# MAGIC    **Dedicated**, et seul l'utilisateur désigné (vous) peut y exécuter du code. La permission
# MAGIC    porte sur l'objet cluster ; l'access mode décide qui exécute.
# MAGIC 3. Dans le JSON : `num_workers: 0`, `node_type_id` et `driver_node_type_id` à
# MAGIC    `Standard_D4ds_v5`, `data_security_mode: SINGLE_USER` et `single_user_name`,
# MAGIC    `autotermination_minutes: 20`, `custom_tags.ResourceClass: SingleNode`, le `policy_id`, et
# MAGIC    `runtime_engine: PHOTON` si Photon est resté coché (à relever).
