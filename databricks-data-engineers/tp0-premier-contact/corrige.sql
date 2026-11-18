-- TP 0 : lire un lakehouse en 30 minutes. Corrigé.
-- SQL editor, SQL warehouse wh-dki-formation.
-- Exécuté le 16/11/2026 sur la plateforme de la formation, compte formateur.

-- =========================================================================
-- Mission 1 : où suis-je ?
-- =========================================================================
SELECT current_user(), current_catalog();
-- stagiaire01@<domaine>, <catalog-du-workspace> (le catalog qui porte le nom du
-- workspace, catalog par défaut).

SHOW CATALOGS;
-- <catalog-du-workspace>, dki_formation (préparé pour la formation), samples (sous « Shares received » dans le
-- Catalog Explorer), system. Pas encore de catalog à vous : TP 3. Le formateur voit en plus
-- lumen_formateur et lumen_sql_formateur.

SHOW TABLES IN samples.bakehouse;
-- 6 tables : media_customer_reviews, media_gold_reviews_chunked, sales_customers,
-- sales_franchises, sales_suppliers, sales_transactions.
-- Les trois niveaux : catalog.schema.table.
-- Note : samples.information_schema ne renvoie rien pour bakehouse ; SHOW TABLES, si.

-- wh-dki-formation : Serverless, 2X-Small, auto stop 10 min, 1 à 2 clusters.

-- =========================================================================
-- Mission 2 : sous le capot
-- =========================================================================
-- 10 colonnes : transactionID, customerID, franchiseID, dateTime, product, quantity, unitPrice,
-- totalPrice, paymentMethod, cardNumber.
-- Colonne sensible : cardNumber (numéro de carte en clair). Réponse attendue en entreprise :
-- column mask ou accès restreint par Unity Catalog (module 4).
-- Details : MANAGED, Delta, Storage location abfss://metastore@….dfs.core.windows.net/…/tables/…
-- Les fichiers sont dans un stockage ADLS, pas dans le warehouse : stockage et calcul séparés.

DESCRIBE HISTORY samples.bakehouse.sales_transactions;
-- Plus de 850 versions (854 le 16/11/2026 ; le nombre augmente, Databricks recrée la table
-- régulièrement). Dernières opérations : CREATE OR REPLACE TABLE AS SELECT, puis
-- SET TBLPROPERTIES. Chaque écriture = une version du journal de transactions.

-- =========================================================================
-- Mission 3 : une question métier
-- =========================================================================
SELECT COUNT(*)        AS transactions,
       SUM(totalPrice) AS chiffre_affaires,
       MIN(dateTime)   AS debut,
       MAX(dateTime)   AS fin
FROM samples.bakehouse.sales_transactions;
-- 3 333 transactions, 66 471, du 2024-05-01 au 2024-05-17.

SELECT f.name, f.city,
       COUNT(*)          AS transactions,
       SUM(t.totalPrice) AS chiffre_affaires
FROM samples.bakehouse.sales_transactions AS t
JOIN samples.bakehouse.sales_franchises   AS f ON t.franchiseID = f.franchiseID
GROUP BY f.name, f.city
ORDER BY chiffre_affaires DESC
LIMIT 5;
-- Baked Bliss (Rome) 63 / 6 642 ; Sweet Sinsations (Stockholm) 60 / 4 512 ;
-- The Crumbly Nook (Sydney) 83 / 2 790 ; Butter Bliss (Honolulu) 64 / 2 514 ;
-- Golden Crumbs (San Francisco) 76 / 2 502.
-- Visualisation : barres, name en X, chiffre_affaires en Y.

SELECT f.franchiseID, f.name, f.city, COUNT(*) AS transactions
FROM samples.bakehouse.sales_transactions AS t
JOIN samples.bakehouse.sales_franchises   AS f ON t.franchiseID = f.franchiseID
GROUP BY f.franchiseID, f.name, f.city
ORDER BY transactions DESC
LIMIT 3;
-- Chiba Chews (Chiba) 90, Butter Babies (Miami) 86, Crumby Delights (Brisbane) 84.
-- Chiba Chews ne fait que 1 482 de chiffre d'affaires : plus de ventes ≠ plus de chiffre.
-- Piège : 48 franchises, 46 noms distincts (deux Sweet Temptations, deux Sugar Rush).
-- GROUP BY f.name seul : « Sweet Temptations, 158 », faux. On groupe par la clé franchiseID.

-- =========================================================================
-- Mission 4 : les limites et le coût
-- =========================================================================
CREATE TABLE samples.bakehouse.essai AS SELECT 1 AS x;
-- [DELTA_UNSUPPORTED_WRITE_SAMPLE_TABLES] Write to sample tables is not supported.
-- Delta refuse, pas Unity Catalog : même un admin ne peut pas écrire dans samples.
-- Genie Code Quick Fix propose essai_fixed : même échec, car c'est le catalog qui est en lecture
-- seule, pas le nom de la table. Reject.

-- Seconde exécution, à l'identique, de la requête des cinq franchises, puis Query History :
-- 1re : ≈ 0,9 s, 3 381 lignes lues (3 333 + 48), 2 fichiers.
-- 2e  : ≈ 0,25 s, badge Cache, aucune ligne lue, pas de query profile.
-- Cache de résultats du warehouse : même requête, mêmes données, aucun calcul.

-- =========================================================================
-- Bonus : Genie Code
-- =========================================================================
SELECT product, SUM(quantity) AS quantite
FROM samples.bakehouse.sales_transactions
GROUP BY product
ORDER BY quantite DESC;
-- Golden Gate Ginger 3 865, Outback Oatmeal 3 733, Austin Almond Biscotti 3 716 ; 6 produits.
-- Vérifier que le SQL de l'assistant somme quantity au lieu de compter les lignes.
