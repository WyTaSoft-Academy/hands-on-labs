-- TP 1 : corrigé. SQL editor, SQL warehouse partagé.
-- Remplacer <stockage> par le nom du storage account.
-- Les résultats attendus viennent du fichier des résultats attendus (section tp1) : ce SQL n'a pas
-- encore été exécuté sur un workspace. À la répétition de la veille, vérifier qu'il les rend.

-- =========================================================================
-- Partie A : réponses
-- =========================================================================
-- 1. Deux resource groups : rg-formation-databricks (créé par nous : le workspace, le storage
--    account, l'Access Connector) et le managed resource group databricks-rg-… (créé par
--    Databricks : réseau, stockage du workspace, et les VMs des clusters quand ils tournent).
-- 2. Premium. Trial n'offre que 14 jours de DBU, pour un essai ; Premium porte Unity Catalog et
--    dure. (Standard, sans Unity Catalog, est retiré depuis le 1er octobre 2026.)
-- 3. L'Access Connector for Azure Databricks, qui porte une managed identity. Rôle
--    Storage Blob Data Contributor, sur le storage account.
-- 4. D'abord le storage credential (cred_formation : l'identité), puis l'external location
--    (ext_dki_formation : le chemin autorisé, avec ce credential). Puis le GRANT READ FILES.

-- =========================================================================
-- Étape 2 : lister
-- =========================================================================
LIST 'abfss://formation@<stockage>.dfs.core.windows.net/banque/';
-- arrivees/  clients.csv  comptes.csv  transactions/

LIST 'abfss://formation@<stockage>.dfs.core.windows.net/banque/transactions/';
-- 2026-01.parquet … 2026-06.parquet

-- =========================================================================
-- Étape 3 : lire clients.csv
-- =========================================================================
-- Sans option : une seule colonne, nommée « client_id;nom;prenom;… » (read_files lit bien la
-- première ligne comme en-tête), qui contient toute la ligne, plus _rescued_data. Le séparateur
-- par défaut est la virgule ; le fichier utilise le point-virgule. (Constaté le 13/11/2026.)
SELECT * FROM read_files(
  'abfss://formation@<stockage>.dfs.core.windows.net/banque/clients.csv',
  format => 'csv')
LIMIT 5;

SELECT * FROM read_files(
  'abfss://formation@<stockage>.dfs.core.windows.net/banque/clients.csv',
  format => 'csv', header => true, sep => ';')
LIMIT 5;

-- =========================================================================
-- Étape 4 : compter, puis corriger les types
-- =========================================================================
SELECT COUNT(*)                  AS lignes,             -- 52
       COUNT(DISTINCT client_id) AS clients_distincts,  -- 50 : 2 doublons
       COUNT_IF(email IS NULL)   AS sans_email          -- 3
FROM read_files(
  'abfss://formation@<stockage>.dfs.core.windows.net/banque/clients.csv',
  format => 'csv', header => true, sep => ';');

DESCRIBE QUERY
SELECT * FROM read_files(
  'abfss://formation@<stockage>.dfs.core.windows.net/banque/clients.csv',
  format => 'csv', header => true, sep => ';');
-- La colonne à problème : code_postal est déduit comme un entier : 06000 (Nice) devient 6000.
-- Un code postal est un identifiant, pas un nombre.
-- Les dates jj/mm/aaaa, elles, sont bien déduites en DATE, et dans le bon sens (01/12/1985 donne
-- 1985-12-01) : constaté le 13/11/2026 sur le SQL warehouse serverless. Le to_date ci-dessous
-- reste inoffensif, et sert si un runtime plus ancien les laisse en STRING.

SELECT client_id, nom, ville, code_postal,
       to_date(date_naissance, 'dd/MM/yyyy') AS date_naissance,
       to_date(date_entree,    'dd/MM/yyyy') AS date_entree
FROM read_files(
  'abfss://formation@<stockage>.dfs.core.windows.net/banque/clients.csv',
  format => 'csv', header => true, sep => ';',
  schemaHints => 'code_postal STRING')
WHERE code_postal = '06000'
LIMIT 5;
-- 2 lignes : les clients de l'agence de Nice, code postal '06000' et non plus 6000.

-- =========================================================================
-- Étape 5 : les transactions, un dossier entier
-- =========================================================================
SELECT COUNT(*)                       AS lignes,          -- 3214
       COUNT(DISTINCT transaction_id) AS distinctes,      -- 3209
       MIN(horodatage)                AS premiere,        -- 2026-01-01 07:04:00
       MAX(horodatage)                AS derniere         -- 2027-02-25 06:00:00 : une date future
FROM read_files(
  'abfss://formation@<stockage>.dfs.core.windows.net/banque/transactions/',
  format => 'parquet');

SELECT devise, COUNT(*) AS operations
FROM read_files(
  'abfss://formation@<stockage>.dfs.core.windows.net/banque/transactions/',
  format => 'parquet')
GROUP BY devise
ORDER BY operations DESC;
-- EUR 3180, CHF 18, USD 9, GBP 7

-- =========================================================================
-- Étape 6 : le registre des défauts
-- =========================================================================
WITH tr AS (
  SELECT * FROM read_files(
    'abfss://formation@<stockage>.dfs.core.windows.net/banque/transactions/', format => 'parquet')
), co AS (
  SELECT * FROM read_files(
    'abfss://formation@<stockage>.dfs.core.windows.net/banque/comptes.csv',
    format => 'csv', header => true, sep => ';')
), cl AS (
  SELECT * FROM read_files(
    'abfss://formation@<stockage>.dfs.core.windows.net/banque/clients.csv',
    format => 'csv', header => true, sep => ';')
)
SELECT 'montant_nul' AS defaut, COUNT_IF(montant = 0) AS lignes FROM tr                    -- 4
UNION ALL
SELECT 'date_future', COUNT_IF(horodatage >= '2026-07-01') FROM tr                         -- 2
UNION ALL
SELECT 'compte_inconnu', COUNT(*) FROM tr LEFT ANTI JOIN co ON tr.compte_id = co.compte_id -- 3
UNION ALL
SELECT 'doublon_en_trop', COUNT(*) - COUNT(DISTINCT transaction_id) FROM tr                -- 5
UNION ALL
SELECT 'compte_sans_client', COUNT(*) FROM co LEFT ANTI JOIN cl ON co.client_id = cl.client_id; -- 2

-- =========================================================================
-- Bonus 1 : la première arrivée quotidienne
-- =========================================================================
WITH ar AS (
  SELECT * FROM read_files(
    'abfss://formation@<stockage>.dfs.core.windows.net/banque/arrivees/transactions_2026-07-01.csv',
    format => 'csv', header => true)
), tr AS (
  SELECT transaction_id FROM read_files(
    'abfss://formation@<stockage>.dfs.core.windows.net/banque/transactions/', format => 'parquet')
)
SELECT COUNT(*)                                       AS lignes,          -- 25
       COUNT_IF(statut = 'ANNULEE')                   AS annulees,        -- 4
       COUNT_IF(statut = 'ANNULEE' AND transaction_id IN (SELECT transaction_id FROM tr))
                                                      AS deja_recues      -- 4
FROM ar;
-- Les 4 annulations portent sur des opérations déjà reçues : il faudra METTRE À JOUR ces
-- lignes, et insérer les autres. C'est un MERGE, au TP 5.

-- =========================================================================
-- Bonus 2 : le dossier des catalogs (plateforme de la formation)
-- =========================================================================
LIST 'abfss://formation@<stockage>.dfs.core.windows.net/catalogs/';
-- Ça passe (constaté le 13/11/2026) : catalogs/dki_formation/ et catalogs/stagiaire01/.
-- Une seule external location, ext_dki_formation, couvre tout le container formation, et le
-- groupe grp-dki-stagiaires y a READ FILES, WRITE FILES, CREATE MANAGED STORAGE et
-- CREATE EXTERNAL TABLE. C'est Unity Catalog qui décide, chemin par chemin : ici, il a tout ouvert.
-- À dire en restitution : un stagiaire peut donc lire, et écrire, les fichiers des catalogs des
-- autres par leur chemin abfss://. Sur un vrai projet, on sépare les external locations.
