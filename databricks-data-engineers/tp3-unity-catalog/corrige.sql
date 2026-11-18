-- TP 3 : corrigé. SQL editor, SQL warehouse wh-dki-formation.
-- Remplacer <stockage>, <domaine>, stagiaire01 (vous) et stagiaire02 (votre binôme).
-- Les résultats attendus viennent du fichier des résultats attendus (sections tp3 et tp1) : ce SQL n'a
-- pas encore été exécuté sur un workspace. À la répétition de la veille, le dérouler avec deux
-- comptes, et corriger les messages d'erreur cités s'ils ont changé.

-- =========================================================================
-- Partie A : réponses
-- =========================================================================
-- 1. Le container gere, couvert par l'external location ext_dki_formation (même storage credential
--    cred_formation qu'au TP 1).
-- 2. CREATE MANAGED STORAGE sur ext_dki_formation ; CREATE CATALOG sur le metastore.
-- 3. conn_sqldb_dki, de type SQL Server, avec l'utilisateur SQL lumen_lecture, membre du rôle
--    db_datareader de la base lumen : lecture seule. Le mot de passe n'est visible de personne,
--    pas même dans les détails de la connection.

-- =========================================================================
-- Étape 1 : le catalog et ses schemas
-- =========================================================================
CREATE CATALOG IF NOT EXISTS lumen_stagiaire01
  MANAGED LOCATION 'abfss://formation@<stockage>.dfs.core.windows.net/catalogs/stagiaire01'
  COMMENT 'Banque Lumen (fictive) : le catalog de stagiaire01';

CREATE SCHEMA IF NOT EXISTS lumen_stagiaire01.bronze COMMENT 'Données telles qu''elles arrivent';
CREATE SCHEMA IF NOT EXISTS lumen_stagiaire01.silver COMMENT 'Données nettoyées : TP 4';
CREATE SCHEMA IF NOT EXISTS lumen_stagiaire01.gold   COMMENT 'Données prêtes à consommer';
-- Owner : stagiaire01, le créateur.

-- =========================================================================
-- Étape 2 : les tables bronze
-- =========================================================================
CREATE OR REPLACE TABLE lumen_stagiaire01.bronze.clients
  COMMENT 'clients.csv tel que reçu, doublons compris'
AS SELECT *
FROM read_files(
  'abfss://formation@<stockage>.dfs.core.windows.net/banque/clients.csv',
  format => 'csv', header => true, sep => ';',
  schemaHints => 'code_postal STRING');

CREATE OR REPLACE TABLE lumen_stagiaire01.bronze.transactions
  COMMENT 'Opérations de janvier à juin 2026, telles que reçues'
AS SELECT *
FROM read_files(
  'abfss://formation@<stockage>.dfs.core.windows.net/banque/transactions/',
  format => 'parquet');

CREATE TABLE IF NOT EXISTS lumen_stagiaire01.bronze.comptes;

COPY INTO lumen_stagiaire01.bronze.comptes
FROM 'abfss://formation@<stockage>.dfs.core.windows.net/banque/comptes.csv'
FILEFORMAT = CSV
FORMAT_OPTIONS ('header' = 'true', 'sep' = ';', 'inferSchema' = 'true', 'mergeSchema' = 'true')
COPY_OPTIONS ('mergeSchema' = 'true');
-- num_affected_rows = num_inserted_rows = 96

-- 4. Le même COPY INTO, relancé : 0 ligne. COPY INTO retient les fichiers déjà chargés ; il ne
--    chargerait qu'un fichier nouveau (ou modifié) déposé au même endroit.

-- 5.
SELECT 'clients' AS t, COUNT(*) AS lignes FROM lumen_stagiaire01.bronze.clients        -- 52
UNION ALL
SELECT 'comptes', COUNT(*) FROM lumen_stagiaire01.bronze.comptes                        -- 96
UNION ALL
SELECT 'transactions', COUNT(*) FROM lumen_stagiaire01.bronze.transactions;             -- 3214

-- =========================================================================
-- Étape 3 : décrire
-- =========================================================================
DESCRIBE EXTENDED lumen_stagiaire01.bronze.clients;
-- Type : MANAGED. Location : abfss://formation@<stockage>.dfs.core.windows.net/catalogs/stagiaire01/__unitystorage/…
-- un sous-dossier choisi par Unity Catalog, avec des identifiants : on ne choisit que la racine.

ALTER TABLE lumen_stagiaire01.bronze.clients ALTER COLUMN email COMMENT 'Donnée personnelle';

-- 3. _rescued_data, ajoutée par read_files : ce qui n'a pas pu être rangé dans une colonne
--    (type inattendu, colonne en trop). Elle doit être NULL partout :
SELECT COUNT_IF(_rescued_data IS NOT NULL) AS lignes_sauvees   -- 0
FROM lumen_stagiaire01.bronze.clients;

-- =========================================================================
-- Étape 4 : les privileges, en binôme
-- =========================================================================
CREATE OR REPLACE VIEW lumen_stagiaire01.gold.v_clients
  COMMENT 'Clients sans données personnelles directes, une ligne par client'
AS SELECT DISTINCT client_id, segment, agence_id, ville, code_postal
FROM lumen_stagiaire01.bronze.clients;

-- 2. SELECT seulement
GRANT SELECT ON TABLE lumen_stagiaire01.gold.v_clients TO `stagiaire02@<domaine>`;
-- Le binôme : SELECT * FROM lumen_stagiaire01.gold.v_clients;
-- Erreur PERMISSION_DENIED : il n'a pas USE CATALOG sur lumen_stagiaire01 (ni USE SCHEMA sur
-- gold). Sans les deux USE, la view est invisible.

-- 3. Ce qui manque, au plus juste : USE CATALOG sur le catalog, USE SCHEMA sur gold seulement.
GRANT USE CATALOG ON CATALOG lumen_stagiaire01 TO `stagiaire02@<domaine>`;
GRANT USE SCHEMA  ON SCHEMA  lumen_stagiaire01.gold TO `stagiaire02@<domaine>`;
-- Le binôme relit la view : 50 lignes. La view lit bronze.clients avec les privileges de son
-- owner (vous) : le binôme n'a besoin d'aucun privilege sur la table.

-- 4. Le binôme : SELECT * FROM lumen_stagiaire01.bronze.clients;
-- Erreur PERMISSION_DENIED : pas de USE SCHEMA sur bronze, ni de SELECT sur la table.

-- 5.
SHOW GRANTS ON TABLE lumen_stagiaire01.gold.v_clients;
SHOW GRANTS ON CATALOG lumen_stagiaire01;
-- Lineage de la view : bronze.clients en amont.

-- =========================================================================
-- Étape 5 : Azure SQL, par Lakehouse Federation
-- =========================================================================
CREATE FOREIGN CATALOG IF NOT EXISTS lumen_sql_stagiaire01
  USING CONNECTION conn_sqldb_dki
  OPTIONS (database 'sqldb-dki');
-- Schemas : dbo (et ceux du système, selon la base) ; table : agences.

SELECT COUNT(*) AS agences, COUNT(DISTINCT region) AS regions   -- 24, 9
FROM lumen_sql_stagiaire01.dbo.agences;

SELECT a.region, COUNT(DISTINCT c.client_id) AS clients
FROM lumen_stagiaire01.bronze.clients AS c
JOIN lumen_sql_stagiaire01.dbo.agences AS a ON c.agence_id = a.agence_id
GROUP BY a.region
ORDER BY clients DESC;
-- Auvergne-Rhône-Alpes 10, Île-de-France 9, Pays de la Loire 7, Occitanie 5, puis quatre régions
-- à 4 (Grand Est, Hauts-de-France, Nouvelle-Aquitaine, Provence-Alpes-Côte d'Azur : leur ordre
-- entre elles n'est pas garanti), et Bretagne 3. Total 50 : aucun client sans agence connue.
-- Piège : COUNT(*) au lieu de COUNT(DISTINCT client_id) compte les 2 doublons.

-- 3b. Les clients distincts par agence
SELECT agence_id, COUNT(DISTINCT client_id) AS clients
FROM lumen_stagiaire01.bronze.clients
GROUP BY agence_id
ORDER BY clients DESC;
-- La plus grosse : AG18 (Angers), 5 clients. Pas de « plus petite » : sept agences ex aequo.

-- Combien d'agences n'ont qu'un client ?
SELECT COUNT(*) AS agences, array_sort(collect_list(agence_id)) AS lesquelles
FROM (SELECT agence_id
      FROM lumen_stagiaire01.bronze.clients
      GROUP BY agence_id
      HAVING COUNT(DISTINCT client_id) = 1);
-- 7 : AG01, AG08, AG10, AG12, AG15, AG19, AG22.

CREATE OR REPLACE TABLE lumen_stagiaire01.bronze.agences
  COMMENT 'Copie de dbo.agences (Azure SQL), instantané du TP 3'
AS SELECT * FROM lumen_sql_stagiaire01.dbo.agences;
-- 24 lignes. Pourquoi copier : chaque requête fédérée interroge Azure SQL, qui sert peut-être une
-- application ; la copie en Delta a un historique, et les jointures des TP 4 à 6 se font alors
-- sans toucher la base source. Le revers : c'est un instantané, à rafraîchir (module 7).

-- =========================================================================
-- Bonus
-- =========================================================================
-- 1.
DROP TABLE lumen_stagiaire01.bronze.comptes;
SHOW TABLES IN lumen_stagiaire01.bronze;          -- comptes a disparu
UNDROP TABLE lumen_stagiaire01.bronze.comptes;
SELECT COUNT(*) FROM lumen_stagiaire01.bronze.comptes;   -- 96

-- 2.
CREATE VOLUME IF NOT EXISTS lumen_stagiaire01.bronze.depots;
-- (dépôt de segments.csv par le Catalog Explorer)
SELECT * FROM read_files(
  '/Volumes/lumen_stagiaire01/bronze/depots/segments.csv',
  format => 'csv', header => true, sep => ';');
-- 3 lignes

-- 3.
SELECT table_schema, table_name, table_type
FROM lumen_stagiaire01.information_schema.tables
WHERE table_schema <> 'information_schema'
ORDER BY table_schema, table_name;
-- bronze : agences, clients, comptes, transactions (MANAGED) ; gold : v_clients (VIEW)
