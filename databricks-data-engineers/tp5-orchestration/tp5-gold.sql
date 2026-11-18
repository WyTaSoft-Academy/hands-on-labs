-- Databricks notebook source
-- MAGIC %md
-- MAGIC # TP 5 : tp5-gold (corrigé)
-- MAGIC
-- MAGIC Recalcule `gold.flux_mensuels` à partir de juin, sur les seules opérations `VALIDEE`, en
-- MAGIC un seul commit (`REPLACE WHERE`). Juin est recalculé parce que les annulations de juillet
-- MAGIC portent sur des opérations de juin. Les taux de change ne couvrent que le premier
-- MAGIC semestre : les arrivées de juillet sont toutes en euros.
-- MAGIC
-- MAGIC Chiffres : fichier des résultats attendus, section `tp5.gold`. **Exécuté le 13/11/2026** sur la plateforme de la formation : chiffres conformes.
-- MAGIC Exécution à la main : remplir d'abord le widget `catalog` en haut du notebook (l'interface le crée vide).

-- COMMAND ----------

CREATE WIDGET TEXT catalog DEFAULT 'lumen_stagiaire01';

-- COMMAND ----------

USE CATALOG IDENTIFIER(:catalog);

-- COMMAND ----------

INSERT INTO gold.flux_mensuels
REPLACE WHERE mois >= DATE'2026-06-01'
WITH taux_mois AS (
  SELECT date_trunc('MONTH', jour) AS mois, devise, AVG(taux) AS taux
  FROM bronze.taux_change
  WHERE jour >= '2026-01-01'
  GROUP BY ALL
)
SELECT cl.agence_id,
       CAST(date_trunc('MONTH', t.horodatage) AS DATE) AS mois,
       COUNT(*) AS operations,
       ROUND(SUM(CASE WHEN t.devise = 'EUR' THEN t.montant ELSE t.montant / tm.taux END), 2)
         AS montant_net_eur
FROM silver.transactions AS t
JOIN bronze.comptes AS co ON t.compte_id = co.compte_id
JOIN silver.clients AS cl ON co.client_id = cl.client_id
LEFT JOIN taux_mois AS tm
  ON tm.devise = t.devise AND tm.mois = date_trunc('MONTH', t.horodatage)
WHERE t.statut = 'VALIDEE'
  AND t.horodatage >= '2026-06-01'
GROUP BY ALL;

-- COMMAND ----------

SELECT mois, COUNT(*) AS agences, SUM(operations) AS operations
FROM gold.flux_mensuels
GROUP BY mois
ORDER BY mois;
-- Après les trois jours : 2026-01 à 05 inchangés (529, 521, 521, 506, 505),
-- 2026-06 510 (521 moins 11 : sur les 12 annulations, une porte sur un compte sans client, déjà
-- absent de la gold), 2026-07 62. 3154 opérations, et 167 lignes, pas 24 × 7 = 168 : l'agence
-- AG15 (Lumen Bordeaux) n'a aucune opération du 1er au 3 juillet, donc pas de ligne en juillet.
