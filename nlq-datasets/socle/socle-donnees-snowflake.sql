-- =====================================================================
-- SOCLE rempli, pour Snowflake.
--
-- Version PARTICIPANT, a distribuer au lancement du TP 1 bis.
--
-- Les memes donnees que socle-donnees-duckdb.sql : les six tables de
-- modele-socle-participant.sql, remplies d'une petite banque fictive.
-- Ce fichier ne contient que les donnees : les requetes, c'est vous qui
-- les ecrivez.
--
-- Dans une worksheet Snowsight : choisir un entrepot (warehouse), une
-- base et un schema ou vous avez le droit de creer des tables, puis
-- tout executer (Run All).
-- Banque fictive, donnees inventees.
-- =====================================================================

-- A adapter : un schema par binome evite que les equipes s'ecrasent.
-- USE WAREHOUSE <votre_entrepot>;
-- USE DATABASE  <votre_base>;
-- CREATE SCHEMA IF NOT EXISTS SOCLE_BINOME_01;
-- USE SCHEMA    SOCLE_BINOME_01;


-- ---------------------------------------------------------------------
-- D_AGE : quatre agences, deux regions
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE D_AGE (
  ID_AGE       NUMBER(6)      NOT NULL,
  LIB_AGE      VARCHAR(60),
  CD_REG       VARCHAR(4),
  CD_DEP       VARCHAR(3)
);

INSERT INTO D_AGE (ID_AGE, LIB_AGE, CD_REG, CD_DEP) VALUES
  (1, 'Lyon Part-Dieu', 'ARA', '69'),
  (2, 'Grenoble Gares', 'ARA', '38'),
  (3, 'Paris Opera',    'IDF', '75'),
  (4, 'Nanterre',       'IDF', '92');

-- ---------------------------------------------------------------------
-- D_PRD : les produits
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE D_PRD (
  CD_PRD       VARCHAR(12)    NOT NULL,
  LIB_PRD      VARCHAR(60),
  CD_SFAM      VARCHAR(8),
  CD_FAM       VARCHAR(8)
);

INSERT INTO D_PRD (CD_PRD, LIB_PRD, CD_SFAM, CD_FAM) VALUES
  ('IMMO-FIX',  'PRET HAB TF',    'IMMO',  'PART'),
  ('IMMO-PTZ',  'PTZ+',           'IMMO',  'PART'),
  ('CONSO-AUT', 'PRET AUTO',      'CONSO', 'PART'),
  ('CONSO-PER', 'PRET PERSO',     'CONSO', 'PART'),
  ('TRESO-PRO', 'CREDIT TRESO',   'TRESO', 'PRO');

-- ---------------------------------------------------------------------
-- D_CLI : les clients
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE D_CLI (
  ID_CLI       NUMBER(12)     NOT NULL,
  NOM          VARCHAR(80),
  DT_NAI       DATE,
  CD_SEG       VARCHAR(4),
  CD_AGE_RAT   NUMBER(6),
  TOP_ACT      CHAR(1),
  DT_ENT       DATE,
  DT_SOR       DATE
);

INSERT INTO D_CLI (ID_CLI, NOM, DT_NAI, CD_SEG, CD_AGE_RAT, TOP_ACT, DT_ENT, DT_SOR) VALUES
  ( 1, 'MARTIN',      '1975-04-12', 'PA', 1, 'O', '2010-02-01', NULL),
  ( 2, 'BERNARD',     '1947-01-30', 'PA', 1, 'O', '1995-06-15', NULL),
  ( 3, 'DUBOIS',      '1988-09-02', 'PA', 3, 'O', '2025-11-20', NULL),
  ( 4, 'THOMAS',      '1980-12-19', 'PA', 3, 'O', '2012-03-05', NULL),
  ( 5, 'ROBERT',      '1970-07-07', 'PR', 4, 'O', '2015-10-01', NULL),
  ( 6, 'RICHARD SAS', NULL,              'PE', 4, 'O', '2024-11-04', NULL),
  ( 7, 'PETIT',       '1999-05-23', 'PA', 2, 'O', '2026-02-10', NULL),
  ( 8, 'DURAND',      '1985-03-14', 'PA', 1, 'O', '2018-09-01', NULL),
  ( 9, 'LEROY',       '1992-11-08', 'PA', 3, 'N', '2026-07-01', NULL),
  (10, 'MOREAU',      '1960-02-27', 'PA', 2, 'O', '2001-01-15', '2026-08-14'),
  (11, 'SIMON',       '1965-08-16', 'PA', 2, 'N', '2005-04-01', '2026-07-03'),
  (12, 'LAURENT',     '1990-06-01', 'PA', 1, 'N', '2016-05-12', NULL),
  (13, 'LEFEBVRE',    '1955-10-10', 'PA', 4, 'N', '1990-09-01', '2024-11-30');

-- ---------------------------------------------------------------------
-- D_CPT : les comptes
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE D_CPT (
  ID_CPT       NUMBER(12)     NOT NULL,
  ID_CLI       NUMBER(12)     NOT NULL,
  CD_TYP_CPT   VARCHAR(4),
  DT_OUV       DATE,
  DT_CLO       DATE,
  SLD          NUMBER(18,2)
);

INSERT INTO D_CPT (ID_CPT, ID_CLI, CD_TYP_CPT, DT_OUV, DT_CLO, SLD) VALUES
  (101,  1, 'CCO', '2010-02-01', NULL,        2450.30),
  (102,  2, 'CCO', '1995-06-15', NULL,             18200.00),
  (103,  3, 'CCO', '2025-11-20', NULL,              1320.50),
  (104,  4, 'CCO', '2012-03-05', NULL,              3890.00),
  (105,  5, 'CCO', '2015-10-01', NULL,              -420.00),
  (106,  6, 'CCO', '2024-11-04', NULL,             12500.00),
  (107,  7, 'CCO', '2026-02-10', NULL,               640.00),
  (108,  8, 'CCO', '2018-09-01', NULL,              5120.00),
  (109,  9, 'CCO', '2026-07-01', NULL,               980.00),
  (110, 10, 'CCO', '2001-01-15', '2026-08-14',     0.00),
  (111, 11, 'CCO', '2005-04-01', '2026-07-03',     0.00),
  (112, 12, 'CCO', '2016-05-12', '2026-09-20',     0.00),
  (113, 13, 'CCO', '1990-09-01', '2024-11-30',     0.00),
  (120,  1, 'LVA', '2010-02-01', NULL,             22950.00),
  (121,  4, 'LVA', '2012-03-05', NULL,              8000.00),
  (122, 12, 'LVA', '2016-05-12', '2026-09-20',     0.00),
  (123,  8, 'PEL', '2018-09-01', NULL,             61200.00);

-- ---------------------------------------------------------------------
-- F_CRD_MNS : les credits
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE F_CRD_MNS AS
WITH credits AS (
  SELECT * FROM VALUES
    ( 1, 1, 1, 'IMMO-FIX',  300000.00, '2019-01-10'::DATE, 240, 0.0130, NULL::DATE,        NULL::DATE),
    ( 2, 2, 1, 'CONSO-AUT',  25000.00, '2019-03-04'::DATE,  48, 0.0450, NULL,              NULL),
    ( 3, 3, 3, 'IMMO-FIX',  400000.00, '2026-01-15'::DATE, 300, 0.0340, NULL,              NULL),
    ( 4, 3, 3, 'IMMO-PTZ',   40000.00, '2026-01-15'::DATE, 240, 0.0000, NULL,              NULL),
    ( 5, 4, 2, 'IMMO-FIX',  180000.00, '2022-06-20'::DATE, 240, 0.0180, NULL,              NULL),
    ( 6, 5, 4, 'IMMO-FIX',   60000.00, '2024-09-05'::DATE, 180, 0.0410, NULL,              NULL),
    ( 7, 6, 4, 'TRESO-PRO',  50000.00, '2025-01-08'::DATE,  36, 0.0520, '2025-10-01'::DATE, '2025-10-01'::DATE),
    ( 8, 7, 2, 'CONSO-PER',   8000.00, '2026-09-12'::DATE,  48, 0.0590, NULL,              NULL),
    ( 9, 8, 1, 'IMMO-FIX',  220000.00, '2026-09-03'::DATE, 300, 0.0335, NULL,              NULL),
    (10, 9, 3, 'CONSO-PER',  12000.00, '2026-08-28'::DATE,  60, 0.0610, NULL,              NULL),
    (11, 5, 4, 'CONSO-AUT',  15000.00, '2023-05-11'::DATE,  60, 0.0490, NULL,              '2026-03-01'::DATE)
  AS t(ID_CRD, ID_CLI, ID_AGE, CD_PRD, MT_OCT, DT_DEB, DUREE, TX_NOM, CT_DEB, DOU_DEB)
),
arretes AS (
  -- 93 fins de mois, de janvier 2019 a septembre 2026
  SELECT LAST_DAY(DATEADD(month, ROW_NUMBER() OVER (ORDER BY SEQ4()) - 1, '2019-01-01'::DATE)) AS DT_ARR
  FROM TABLE(GENERATOR(ROWCOUNT => 93))
),
vivants AS (
  SELECT c.*, a.DT_ARR, DATEDIFF(month, c.DT_DEB, a.DT_ARR) AS K
  FROM credits c
  JOIN arretes a ON a.DT_ARR >= c.DT_DEB
                AND DATEDIFF(month, c.DT_DEB, a.DT_ARR) < c.DUREE
)
SELECT
  ID_CRD::NUMBER(12)                                              AS ID_CRD,
  ID_CLI::NUMBER(12)                                              AS ID_CLI,
  ID_AGE::NUMBER(6)                                               AS ID_AGE,
  CD_PRD::VARCHAR(12)                                             AS CD_PRD,
  DT_ARR,
  DT_DEB,
  DATEADD(hour, 51, DT_ARR::TIMESTAMP_NTZ)                        AS DT_INS,
  MT_OCT::NUMBER(18,2)                                            AS MT_OCT,
  (MT_OCT * (DUREE - K - 1) / DUREE)::NUMBER(18,2)                AS MT_CRD_RST,
  (MT_OCT / DUREE * (1 + TX_NOM * 5))::NUMBER(18,2)               AS MT_ECH,
  TX_NOM::NUMBER(5,4)                                             AS TX_NOM,
  (CASE WHEN K = DUREE - 1    THEN 'SO'
        WHEN DT_ARR >= CT_DEB THEN 'CT'
        ELSE 'AC' END)::VARCHAR(2)                                AS CD_STA,
  (CASE WHEN DT_ARR >= DOU_DEB THEN 'O' ELSE 'N' END)::CHAR(1)    AS TOP_DOU
FROM vivants;

-- ---------------------------------------------------------------------
-- F_OPE : les operations
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE F_OPE (
  ID_OPE       NUMBER(15)     NOT NULL,
  ID_CPT       NUMBER(12)     NOT NULL,
  DT_OPE       DATE           NOT NULL,
  DT_CPT       DATE,
  MT_OPE       NUMBER(18,2),
  SNS          CHAR(1),
  CD_TYP       VARCHAR(4)
);

INSERT INTO F_OPE (ID_OPE, ID_CPT, DT_OPE, DT_CPT, MT_OPE, SNS, CD_TYP) VALUES
  ( 1, 101, '2026-07-01', '2026-07-01', 2600.00, 'C', 'VIR'),
  ( 2, 104, '2026-07-15', '2026-07-15',  950.00, 'D', 'PRL'),
  ( 3, 109, '2026-07-20', '2026-07-21',   45.00, 'D', 'CB'),
  ( 4, 112, '2026-08-05', '2026-08-05',  310.00, 'D', 'PRL'),
  ( 5, 107, '2026-08-29', '2026-08-29',   72.40, 'D', 'CB'),
  ( 6, 101, '2026-08-31', '2026-09-01',   38.90, 'D', 'CB'),
  ( 7, 103, '2026-08-31', '2026-09-02',  120.00, 'D', 'CHQ'),
  ( 8, 101, '2026-09-01', '2026-09-01', 2600.00, 'C', 'VIR'),
  ( 9, 103, '2026-09-02', '2026-09-02', 3100.00, 'C', 'VIR'),
  (10, 104, '2026-09-05', '2026-09-05',  950.00, 'D', 'PRL'),
  (11, 105, '2026-09-06', '2026-09-06',  800.00, 'D', 'VIR'),
  (12, 106, '2026-09-10', '2026-09-10', 4200.00, 'C', 'VIR'),
  (13, 108, '2026-09-12', '2026-09-12',   54.20, 'D', 'CB'),
  (14, 109, '2026-09-15', '2026-09-16',   23.10, 'D', 'CB'),
  (15, 107, '2026-09-18', '2026-09-18',  210.00, 'D', 'PRL'),
  (16, 108, '2026-09-29', '2026-10-01',   61.00, 'D', 'CB'),
  (17, 106, '2026-09-30', '2026-10-02',  300.00, 'D', 'PRL'),
  (18, 105, '2026-09-30', '2026-10-01', 1500.00, 'D', 'VIR'),
  (20, 103, '2026-09-30', '2026-10-01',   19.90, 'D', 'CB'),
  (19, 101, '2026-10-01', '2026-10-01', 2600.00, 'C', 'VIR');
