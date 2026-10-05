-- =====================================================================
-- SOCLE rempli, pour DuckDB.
--
-- Version PARTICIPANT, a distribuer au lancement du TP 1 bis.
--
-- Les six tables de modele-socle-participant.sql, avec les donnees d'une
-- petite banque fictive. Ce fichier ne contient que les donnees : les
-- requetes, c'est vous qui les ecrivez.
--
--   duckdb socle.duckdb -c ".read socle/socle-donnees-duckdb.sql"
--   duckdb -ui socle.duckdb
--
-- Les types sont ceux de DuckDB : DECIMAL plutot que NUMBER.
-- Banque fictive, donnees inventees.
-- =====================================================================


-- ---------------------------------------------------------------------
-- D_AGE : quatre agences, deux regions
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE D_AGE AS
SELECT * FROM (VALUES
  (1, 'Lyon Part-Dieu', 'ARA', '69'),
  (2, 'Grenoble Gares', 'ARA', '38'),
  (3, 'Paris Opera',    'IDF', '75'),
  (4, 'Nanterre',       'IDF', '92')
) AS t(ID_AGE, LIB_AGE, CD_REG, CD_DEP);


-- ---------------------------------------------------------------------
-- D_PRD : les produits
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE D_PRD AS
SELECT * FROM (VALUES
  ('IMMO-FIX',  'PRET HAB TF',    'IMMO',  'PART'),
  ('IMMO-PTZ',  'PTZ+',           'IMMO',  'PART'),
  ('CONSO-AUT', 'PRET AUTO',      'CONSO', 'PART'),
  ('CONSO-PER', 'PRET PERSO',     'CONSO', 'PART'),
  ('TRESO-PRO', 'CREDIT TRESO',   'TRESO', 'PRO')
) AS t(CD_PRD, LIB_PRD, CD_SFAM, CD_FAM);


-- ---------------------------------------------------------------------
-- D_CLI : les clients
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE D_CLI AS
SELECT * FROM (VALUES
  ( 1, 'MARTIN',      DATE '1975-04-12', 'PA', 1, 'O', DATE '2010-02-01', NULL::DATE),
  ( 2, 'BERNARD',     DATE '1947-01-30', 'PA', 1, 'O', DATE '1995-06-15', NULL),
  ( 3, 'DUBOIS',      DATE '1988-09-02', 'PA', 3, 'O', DATE '2025-11-20', NULL),
  ( 4, 'THOMAS',      DATE '1980-12-19', 'PA', 3, 'O', DATE '2012-03-05', NULL),
  ( 5, 'ROBERT',      DATE '1970-07-07', 'PR', 4, 'O', DATE '2015-10-01', NULL),
  ( 6, 'RICHARD SAS', NULL,              'PE', 4, 'O', DATE '2024-11-04', NULL),
  ( 7, 'PETIT',       DATE '1999-05-23', 'PA', 2, 'O', DATE '2026-02-10', NULL),
  ( 8, 'DURAND',      DATE '1985-03-14', 'PA', 1, 'O', DATE '2018-09-01', NULL),
  ( 9, 'LEROY',       DATE '1992-11-08', 'PA', 3, 'N', DATE '2026-07-01', NULL),
  (10, 'MOREAU',      DATE '1960-02-27', 'PA', 2, 'O', DATE '2001-01-15', DATE '2026-08-14'),
  (11, 'SIMON',       DATE '1965-08-16', 'PA', 2, 'N', DATE '2005-04-01', DATE '2026-07-03'),
  (12, 'LAURENT',     DATE '1990-06-01', 'PA', 1, 'N', DATE '2016-05-12', NULL),
  (13, 'LEFEBVRE',    DATE '1955-10-10', 'PA', 4, 'N', DATE '1990-09-01', DATE '2024-11-30')
) AS t(ID_CLI, NOM, DT_NAI, CD_SEG, CD_AGE_RAT, TOP_ACT, DT_ENT, DT_SOR);


-- ---------------------------------------------------------------------
-- D_CPT : les comptes
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE D_CPT AS
SELECT * FROM (VALUES
  (101,  1, 'CCO', DATE '2010-02-01', NULL::DATE,        2450.30),
  (102,  2, 'CCO', DATE '1995-06-15', NULL,             18200.00),
  (103,  3, 'CCO', DATE '2025-11-20', NULL,              1320.50),
  (104,  4, 'CCO', DATE '2012-03-05', NULL,              3890.00),
  (105,  5, 'CCO', DATE '2015-10-01', NULL,              -420.00),
  (106,  6, 'CCO', DATE '2024-11-04', NULL,             12500.00),
  (107,  7, 'CCO', DATE '2026-02-10', NULL,               640.00),
  (108,  8, 'CCO', DATE '2018-09-01', NULL,              5120.00),
  (109,  9, 'CCO', DATE '2026-07-01', NULL,               980.00),
  (110, 10, 'CCO', DATE '2001-01-15', DATE '2026-08-14',     0.00),
  (111, 11, 'CCO', DATE '2005-04-01', DATE '2026-07-03',     0.00),
  (112, 12, 'CCO', DATE '2016-05-12', DATE '2026-09-20',     0.00),
  (113, 13, 'CCO', DATE '1990-09-01', DATE '2024-11-30',     0.00),
  (120,  1, 'LVA', DATE '2010-02-01', NULL,             22950.00),
  (121,  4, 'LVA', DATE '2012-03-05', NULL,              8000.00),
  (122, 12, 'LVA', DATE '2016-05-12', DATE '2026-09-20',     0.00),
  (123,  8, 'PEL', DATE '2018-09-01', NULL,             61200.00)
) AS t(ID_CPT, ID_CLI, CD_TYP_CPT, DT_OUV, DT_CLO, SLD);


-- ---------------------------------------------------------------------
-- F_CRD_MNS : les credits
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE F_CRD_MNS AS
WITH credits(ID_CRD, ID_CLI, ID_AGE, CD_PRD, MT_OCT, DT_DEB, DUREE, TX_NOM,
             CT_DEB, DOU_DEB) AS (
  VALUES
    ( 1, 1, 1, 'IMMO-FIX',  300000.00, DATE '2019-01-10', 240, 0.0130, NULL::DATE,        NULL::DATE),
    ( 2, 2, 1, 'CONSO-AUT',  25000.00, DATE '2019-03-04',  48, 0.0450, NULL,              NULL),
    ( 3, 3, 3, 'IMMO-FIX',  400000.00, DATE '2026-01-15', 300, 0.0340, NULL,              NULL),
    ( 4, 3, 3, 'IMMO-PTZ',   40000.00, DATE '2026-01-15', 240, 0.0000, NULL,              NULL),
    ( 5, 4, 2, 'IMMO-FIX',  180000.00, DATE '2022-06-20', 240, 0.0180, NULL,              NULL),
    ( 6, 5, 4, 'IMMO-FIX',   60000.00, DATE '2024-09-05', 180, 0.0410, NULL,              NULL),
    ( 7, 6, 4, 'TRESO-PRO',  50000.00, DATE '2025-01-08',  36, 0.0520, DATE '2025-10-01', DATE '2025-10-01'),
    ( 8, 7, 2, 'CONSO-PER',   8000.00, DATE '2026-09-12',  48, 0.0590, NULL,              NULL),
    ( 9, 8, 1, 'IMMO-FIX',  220000.00, DATE '2026-09-03', 300, 0.0335, NULL,              NULL),
    (10, 9, 3, 'CONSO-PER',  12000.00, DATE '2026-08-28',  60, 0.0610, NULL,              NULL),
    (11, 5, 4, 'CONSO-AUT',  15000.00, DATE '2023-05-11',  60, 0.0490, NULL,              DATE '2026-03-01')
),
arretes AS (
  SELECT last_day(m::DATE) AS DT_ARR
  FROM generate_series(DATE '2019-01-01', DATE '2026-09-01', INTERVAL 1 MONTH) AS g(m)
),
vivants AS (
  SELECT c.*, a.DT_ARR, date_diff('month', c.DT_DEB, a.DT_ARR) AS K
  FROM credits c
  JOIN arretes a ON a.DT_ARR >= c.DT_DEB
                AND date_diff('month', c.DT_DEB, a.DT_ARR) < c.DUREE
)
SELECT
  ID_CRD,
  ID_CLI,
  ID_AGE,
  CD_PRD,
  DT_ARR,
  DT_DEB,
  CAST(DT_ARR AS TIMESTAMP) + INTERVAL 2 DAY + INTERVAL 3 HOUR  AS DT_INS,
  MT_OCT,
  CAST(MT_OCT * (1 - (K + 1) / DUREE) AS DECIMAL(18,2))         AS MT_CRD_RST,
  CAST(MT_OCT / DUREE * (1 + TX_NOM * 5) AS DECIMAL(18,2))      AS MT_ECH,
  TX_NOM,
  CASE WHEN K = DUREE - 1           THEN 'SO'
       WHEN DT_ARR >= CT_DEB        THEN 'CT'
       ELSE 'AC' END                                            AS CD_STA,
  CASE WHEN DT_ARR >= DOU_DEB THEN 'O' ELSE 'N' END             AS TOP_DOU
FROM vivants;


-- ---------------------------------------------------------------------
-- F_OPE : les operations
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE F_OPE AS
SELECT * FROM (VALUES
  ( 1, 101, DATE '2026-07-01', DATE '2026-07-01', 2600.00, 'C', 'VIR'),
  ( 2, 104, DATE '2026-07-15', DATE '2026-07-15',  950.00, 'D', 'PRL'),
  ( 3, 109, DATE '2026-07-20', DATE '2026-07-21',   45.00, 'D', 'CB'),
  ( 4, 112, DATE '2026-08-05', DATE '2026-08-05',  310.00, 'D', 'PRL'),
  ( 5, 107, DATE '2026-08-29', DATE '2026-08-29',   72.40, 'D', 'CB'),
  ( 6, 101, DATE '2026-08-31', DATE '2026-09-01',   38.90, 'D', 'CB'),
  ( 7, 103, DATE '2026-08-31', DATE '2026-09-02',  120.00, 'D', 'CHQ'),
  ( 8, 101, DATE '2026-09-01', DATE '2026-09-01', 2600.00, 'C', 'VIR'),
  ( 9, 103, DATE '2026-09-02', DATE '2026-09-02', 3100.00, 'C', 'VIR'),
  (10, 104, DATE '2026-09-05', DATE '2026-09-05',  950.00, 'D', 'PRL'),
  (11, 105, DATE '2026-09-06', DATE '2026-09-06',  800.00, 'D', 'VIR'),
  (12, 106, DATE '2026-09-10', DATE '2026-09-10', 4200.00, 'C', 'VIR'),
  (13, 108, DATE '2026-09-12', DATE '2026-09-12',   54.20, 'D', 'CB'),
  (14, 109, DATE '2026-09-15', DATE '2026-09-16',   23.10, 'D', 'CB'),
  (15, 107, DATE '2026-09-18', DATE '2026-09-18',  210.00, 'D', 'PRL'),
  (16, 108, DATE '2026-09-29', DATE '2026-10-01',   61.00, 'D', 'CB'),
  (17, 106, DATE '2026-09-30', DATE '2026-10-02',  300.00, 'D', 'PRL'),
  (18, 105, DATE '2026-09-30', DATE '2026-10-01', 1500.00, 'D', 'VIR'),
  (20, 103, DATE '2026-09-30', DATE '2026-10-01',   19.90, 'D', 'CB'),
  (19, 101, DATE '2026-10-01', DATE '2026-10-01', 2600.00, 'C', 'VIR')
) AS t(ID_OPE, ID_CPT, DT_OPE, DT_CPT, MT_OPE, SNS, CD_TYP);
