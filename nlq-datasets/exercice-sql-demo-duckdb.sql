-- =====================================================================
-- Exercice « Lire le SQL d'un moteur » : demo de restitution (DuckDB).
--
-- Pour le FORMATEUR. Un petit SOCLE rempli, puis, pour chaque question,
-- le SQL du moteur a cote du SQL attendu : la salle voit l'ecart en
-- chiffres, sur les memes donnees.
--
--   duckdb -c ".read exercice-sql-demo-duckdb.sql"
--   (ou, dans la console DuckDB :  .read exercice-sql-demo-duckdb.sql)
--
-- Seules les tables des quatre requetes sont creees, avec les colonnes
-- du modele participant. Banque fictive, donnees inventees.
-- =====================================================================


-- ---------------------------------------------------------------------
-- D_PRD : les produits
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE D_PRD AS
SELECT * FROM (VALUES
  ('IMMO-FIX', 'Pret immobilier taux fixe', 'IMMO',  'PART'),
  ('CONSO-AUT', 'Pret automobile',          'CONSO', 'PART'),
  ('CONSO-PER', 'Pret personnel',           'CONSO', 'PART'),
  ('TRESO-PRO', 'Credit de tresorerie',     'TRESO', 'PRO')
) AS t(CD_PRD, LIB_PRD, CD_SFAM, CD_FAM);


-- ---------------------------------------------------------------------
-- F_CRD_MNS : une ligne par credit et par arrete mensuel
--
-- Huit credits, photographies a chaque fin de mois de 2021-01 a 2026-09.
-- Le capital restant du s'amortit lineairement. Les fenetres de
-- contentieux sont choisies pour la requete D :
--   credit 3 (client 103) : en contentieux en 2024, regularise depuis ;
--   credit 6 (client 106) : en contentieux depuis avril 2025 ;
--   credits 7 et 8 (client 107) : en contentieux depuis juin 2026.
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE F_CRD_MNS AS
WITH credits(ID_CRD, ID_CLI, CD_PRD, MT_OCT, DT_DEB, DUREE, CT_DEB, CT_FIN) AS (
  VALUES
    (1, 101, 'IMMO-FIX',  200000.00, DATE '2021-01-01', 240, NULL,              NULL),
    (2, 102, 'IMMO-FIX',  150000.00, DATE '2023-06-01', 240, NULL,              NULL),
    (3, 103, 'CONSO-AUT',  30000.00, DATE '2021-01-01',  60, DATE '2024-03-01', DATE '2024-08-31'),
    (4, 104, 'CONSO-PER',   3000.00, DATE '2025-01-01',  12, NULL,              NULL),
    (5, 105, 'CONSO-PER',   6000.00, DATE '2025-07-01',  24, NULL,              NULL),
    (6, 106, 'TRESO-PRO',  20000.00, DATE '2024-01-01',  36, DATE '2025-04-01', DATE '2099-12-31'),
    (7, 107, 'CONSO-PER',   4000.00, DATE '2025-09-01',  24, DATE '2026-06-01', DATE '2099-12-31'),
    (8, 107, 'CONSO-AUT',   2000.00, DATE '2026-01-01',  12, DATE '2026-06-01', DATE '2099-12-31')
),
arretes AS (
  SELECT last_day(m::DATE) AS DT_ARR
  FROM generate_series(DATE '2021-01-01', DATE '2026-09-01', INTERVAL 1 MONTH) AS g(m)
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
  1                                               AS ID_AGE,
  CD_PRD,
  DT_ARR,
  DT_DEB,
  CAST(DT_ARR AS TIMESTAMP) + INTERVAL 2 DAY      AS DT_INS,
  MT_OCT,
  CAST(MT_OCT * (1 - (K + 1) / DUREE) AS DECIMAL(18,2)) AS MT_CRD_RST,
  CAST(MT_OCT / DUREE AS DECIMAL(18,2))           AS MT_ECH,
  0.0350                                          AS TX_NOM,
  CASE WHEN DT_ARR BETWEEN CT_DEB AND CT_FIN THEN 'CT' ELSE 'AC' END AS CD_STA,
  'N'                                             AS TOP_DOU
FROM vivants;


-- ---------------------------------------------------------------------
-- F_OPE : quelques operations autour de septembre 2026
--
-- Virements recus (C) et emis (D), plus deux virements a cheval sur le
-- mois : opere fin aout et comptabilise en septembre, opere fin
-- septembre et comptabilise en octobre.
-- ---------------------------------------------------------------------
CREATE OR REPLACE TABLE F_OPE AS
SELECT * FROM (VALUES
  ( 1, 501, DATE '2026-08-31', DATE '2026-09-01',  1500.00, 'C', 'VIR'),  -- aout, compte en septembre
  ( 2, 501, DATE '2026-09-02', DATE '2026-09-02',  2400.00, 'C', 'VIR'),  -- salaire
  ( 3, 502, DATE '2026-09-05', DATE '2026-09-05',  3100.00, 'C', 'VIR'),  -- salaire
  ( 4, 501, DATE '2026-09-08', DATE '2026-09-08',   800.00, 'D', 'VIR'),  -- loyer emis
  ( 5, 502, DATE '2026-09-10', DATE '2026-09-10',  5000.00, 'D', 'VIR'),  -- vers le livret
  ( 6, 503, DATE '2026-09-15', DATE '2026-09-15',   350.00, 'C', 'VIR'),
  ( 7, 503, DATE '2026-09-20', DATE '2026-09-21',  1200.00, 'D', 'VIR'),
  ( 8, 501, DATE '2026-09-30', DATE '2026-10-01',  2000.00, 'C', 'VIR'),  -- septembre, compte en octobre
  ( 9, 501, DATE '2026-09-12', DATE '2026-09-12',    64.90, 'D', 'CB'),
  (10, 502, DATE '2026-09-03', DATE '2026-09-03',   120.00, 'D', 'PRL')
) AS t(ID_OPE, ID_CPT, DT_OPE, DT_CPT, MT_OPE, SNS, CD_TYP);


-- =====================================================================
-- A. « Quel etait l'encours de credit en 2025 ? »
-- =====================================================================

-- Le moteur : somme de toutes les photos mensuelles de 2025.
SELECT 'A - moteur' AS requete, SUM(f.MT_CRD_RST) AS encours
FROM   F_CRD_MNS f
WHERE  f.DT_ARR BETWEEN DATE '2025-01-01' AND DATE '2025-12-31';

-- Attendu : un stock se lit au dernier arrete de l'annee.
SELECT 'A - attendu' AS requete, SUM(f.MT_CRD_RST) AS encours
FROM   F_CRD_MNS f
WHERE  f.DT_ARR = DATE '2025-12-31';


-- =====================================================================
-- B. « Combien nos clients ont-ils recu en virements en septembre ? »
-- =====================================================================

-- Le moteur : emis et recus additionnes, sur la date de comptabilisation.
SELECT 'B - moteur' AS requete, SUM(o.MT_OPE) AS montant_virements
FROM   F_OPE o
WHERE  o.CD_TYP = 'VIR'
  AND  o.DT_CPT BETWEEN DATE '2026-09-01' AND DATE '2026-09-30';

-- Attendu : les seuls virements recus, sur la date d'operation.
SELECT 'B - attendu' AS requete, SUM(o.MT_OPE) AS montant_virements
FROM   F_OPE o
WHERE  o.CD_TYP = 'VIR'
  AND  o.SNS    = 'C'
  AND  o.DT_OPE BETWEEN DATE '2026-09-01' AND DATE '2026-09-30';


-- =====================================================================
-- C. « Quel est le montant moyen d'un credit a la consommation ? »
-- =====================================================================

-- Le moteur : moyenne sur les lignes mensuelles. Le credit de 30 000
-- present 60 mois pese cinq fois plus que celui de 3 000 present 12 mois.
SELECT 'C - moteur' AS requete, ROUND(AVG(f.MT_OCT), 2) AS montant_moyen
FROM   F_CRD_MNS f
JOIN   D_PRD p ON p.CD_PRD = f.CD_PRD
WHERE  p.CD_SFAM = 'CONSO';

-- Attendu : chaque credit compte une fois.
SELECT 'C - attendu' AS requete, ROUND(AVG(c.MT_OCT), 2) AS montant_moyen
FROM  (SELECT DISTINCT f.ID_CRD, f.MT_OCT
       FROM   F_CRD_MNS f
       JOIN   D_PRD p ON p.CD_PRD = f.CD_PRD
       WHERE  p.CD_SFAM = 'CONSO') c;


-- =====================================================================
-- D. « Combien de clients ont un credit en contentieux ? »
-- =====================================================================

-- Le moteur : des lignes, sur tous les arretes confondus.
SELECT 'D - moteur' AS requete, COUNT(*) AS nb_clients
FROM   F_CRD_MNS f
WHERE  f.CD_STA = 'CT';

-- Attendu : des clients distincts, au dernier arrete.
SELECT 'D - attendu' AS requete, COUNT(DISTINCT f.ID_CLI) AS nb_clients
FROM   F_CRD_MNS f
WHERE  f.CD_STA = 'CT'
  AND  f.DT_ARR = (SELECT MAX(DT_ARR) FROM F_CRD_MNS);
