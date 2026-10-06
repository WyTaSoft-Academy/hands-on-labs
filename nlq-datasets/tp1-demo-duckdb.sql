-- =====================================================================
-- TP 1 -- Diagnostic d'un dataset existant : demo de restitution (DuckDB).
--
-- Pour le FORMATEUR. Charge SOCLE rempli (socle/socle-donnees-duckdb.sql),
-- puis, pour chaque question du metier, deux lectures que le SQL autorise.
-- Les deux s'executent ; elles ne donnent pas le meme chiffre. C'est la
-- grille du TP, en chiffres -- et le corrige du TP 1 bis.
--
--   duckdb -c ".read tp1-demo-duckdb.sql"        (depuis le dossier tp/)
--
-- Conventions de la demo : dernier arrete = 2026-09-30, « le mois dernier »
-- = septembre 2026, « ce trimestre » = 2026-T3.
--
-- Les pieges places dans les donnees :
--   client 2  : 79 ans, son seul credit est solde depuis 2023 (Q8) ;
--   client 4  : credit a Grenoble, rattache a Paris -- il a demenage (Q1) ;
--   client 6  : une societe, sans date de naissance (Q8) ;
--   client 9  : TOP_ACT = N, mais credit debloque en aout et operations (Q2) ;
--   client 10 : sorti en aout 2026, TOP_ACT toujours a O (Q2, Q10) ;
--   client 12 : tous ses comptes clotures en septembre, DT_SOR vide (Q10) ;
--   credit 3  : 400 000 debloque en janvier, Paris -- portefeuille jeune (Q7) ;
--   credit 1  : 300 000 depuis 2019, Lyon -- portefeuille ancien (Q7) ;
--   credits 7 et 11 : douteux, tous deux a Nanterre (Q9) ;
--   le dernier mois d'un credit est photographie CD_STA = 'SO', capital nul ;
--   operations 6, 7, 16, 17, 18, 20 : fin de mois, comptabilisees le mois
--   suivant (Q5).
-- =====================================================================

.read socle/socle-donnees-duckdb.sql

-- =====================================================================
-- Q1. Encours de credit immobilier par region au dernier arrete
--     JOINTURE IMPLICITE + GRAIN
-- =====================================================================

-- Lecture 1 : la region de l'agence du CREDIT.
SELECT 'Q1 - agence du credit' AS lecture, a.CD_REG, SUM(f.MT_CRD_RST) AS encours
FROM   F_CRD_MNS f
JOIN   D_PRD p ON p.CD_PRD = f.CD_PRD
JOIN   D_AGE a ON a.ID_AGE = f.ID_AGE
WHERE  p.CD_SFAM = 'IMMO' AND f.DT_ARR = DATE '2026-09-30'
GROUP  BY a.CD_REG ORDER BY a.CD_REG;

-- Lecture 2 : la region de l'agence de rattachement du CLIENT.
SELECT 'Q1 - agence du client' AS lecture, a.CD_REG, SUM(f.MT_CRD_RST) AS encours
FROM   F_CRD_MNS f
JOIN   D_PRD p ON p.CD_PRD = f.CD_PRD
JOIN   D_CLI c ON c.ID_CLI = f.ID_CLI
JOIN   D_AGE a ON a.ID_AGE = c.CD_AGE_RAT
WHERE  p.CD_SFAM = 'IMMO' AND f.DT_ARR = DATE '2026-09-30'
GROUP  BY a.CD_REG ORDER BY a.CD_REG;

-- Et sans « au dernier arrete » : toutes les photos sommees.
SELECT 'Q1 - sans filtre de date' AS lecture, a.CD_REG, SUM(f.MT_CRD_RST) AS encours
FROM   F_CRD_MNS f
JOIN   D_PRD p ON p.CD_PRD = f.CD_PRD
JOIN   D_AGE a ON a.ID_AGE = f.ID_AGE
WHERE  p.CD_SFAM = 'IMMO'
GROUP  BY a.CD_REG ORDER BY a.CD_REG;


-- =====================================================================
-- Q2. Combien avons-nous de clients actifs ?
--     AMBIGUITE SEMANTIQUE
-- =====================================================================

SELECT 'Q2 - TOP_ACT = O'                    AS definition, COUNT(*) AS nb_clients
FROM   D_CLI WHERE TOP_ACT = 'O'
UNION ALL
SELECT 'Q2 - pas de date de sortie',          COUNT(*)
FROM   D_CLI WHERE DT_SOR IS NULL
UNION ALL
SELECT 'Q2 - au moins un compte ouvert',      COUNT(DISTINCT ID_CLI)
FROM   D_CPT WHERE DT_CLO IS NULL
UNION ALL
SELECT 'Q2 - une operation sur 3 mois',       COUNT(DISTINCT c.ID_CLI)
FROM   F_OPE o JOIN D_CPT c ON c.ID_CPT = o.ID_CPT
WHERE  o.DT_OPE BETWEEN DATE '2026-07-01' AND DATE '2026-09-30';

-- Des totaux voisins, mais pas les memes clients : la grille, client par client.
SELECT c.ID_CLI, c.NOM,
       c.TOP_ACT = 'O'                                                AS top_act,
       c.DT_SOR IS NULL                                               AS sans_sortie,
       EXISTS (SELECT 1 FROM D_CPT k WHERE k.ID_CLI = c.ID_CLI AND k.DT_CLO IS NULL) AS compte_ouvert,
       EXISTS (SELECT 1 FROM F_OPE o JOIN D_CPT k ON k.ID_CPT = o.ID_CPT
               WHERE k.ID_CLI = c.ID_CLI
                 AND o.DT_OPE BETWEEN DATE '2026-07-01' AND DATE '2026-09-30') AS operation_3_mois
FROM   D_CLI c
ORDER  BY c.ID_CLI;


-- =====================================================================
-- Q3. Quelle a ete la production de credits le mois dernier ?
--     MESURE ABSENTE + DATE
-- =====================================================================

-- Lecture naive : MT_OCT somme sur l'arrete de septembre = tous les
-- credits vivants, pas les nouveaux.
SELECT 'Q3 - MT_OCT a l''arrete de septembre' AS lecture, SUM(MT_OCT) AS production
FROM   F_CRD_MNS WHERE DT_ARR = DATE '2026-09-30'
UNION ALL
-- Les credits debloques en septembre, chacun une fois.
SELECT 'Q3 - debloques en septembre (DT_DEB)', SUM(MT_OCT)
FROM  (SELECT DISTINCT ID_CRD, MT_OCT FROM F_CRD_MNS
       WHERE DT_DEB BETWEEN DATE '2026-09-01' AND DATE '2026-09-30')
;
-- Le premier chiffre est cinq fois et demie le second : il compte tout le
-- portefeuille vivant, y compris le credit de 400 000 debloque en janvier.


-- =====================================================================
-- Q4. Quel est le taux moyen des credits immobiliers ?
--     AGREGATION
-- =====================================================================

SELECT 'Q4 - moyenne simple'           AS lecture,
       ROUND(100 * AVG(f.TX_NOM), 3)    AS taux_pct
FROM   F_CRD_MNS f JOIN D_PRD p ON p.CD_PRD = f.CD_PRD
WHERE  p.CD_SFAM = 'IMMO' AND f.DT_ARR = DATE '2026-09-30'
UNION ALL
SELECT 'Q4 - ponderee par le capital',
       ROUND(100 * SUM(f.TX_NOM * f.MT_CRD_RST) / SUM(f.MT_CRD_RST), 3)
FROM   F_CRD_MNS f JOIN D_PRD p ON p.CD_PRD = f.CD_PRD
WHERE  p.CD_SFAM = 'IMMO' AND f.DT_ARR = DATE '2026-09-30';


-- =====================================================================
-- Q5. Combien d'operations par type le mois dernier ?
--     DATE + AMBIGUITE SEMANTIQUE (des codes sans libelles)
-- =====================================================================

SELECT CD_TYP,
       COUNT(*) FILTER (WHERE DT_OPE BETWEEN DATE '2026-09-01' AND DATE '2026-09-30') AS sur_DT_OPE,
       COUNT(*) FILTER (WHERE DT_CPT BETWEEN DATE '2026-09-01' AND DATE '2026-09-30') AS sur_DT_CPT
FROM   F_OPE
GROUP  BY CD_TYP ORDER BY CD_TYP;


-- =====================================================================
-- Q6. Quel est le solde moyen des comptes courants ?
--     DATE : le solde n'a pas de date
-- =====================================================================

-- Deux chiffres... et aucun des deux ne dit « a quelle date ».
SELECT 'Q6 - tous les CCO'         AS lecture, ROUND(AVG(SLD), 2) AS solde_moyen
FROM   D_CPT WHERE CD_TYP_CPT = 'CCO'
UNION ALL
SELECT 'Q6 - CCO non clotures',    ROUND(AVG(SLD), 2)
FROM   D_CPT WHERE CD_TYP_CPT = 'CCO' AND DT_CLO IS NULL;


-- =====================================================================
-- Q7. Quelle agence porte le plus d'encours ?
--     GRAIN + DATE : le classement s'inverse
-- =====================================================================

SELECT a.LIB_AGE,
       SUM(f.MT_CRD_RST) FILTER (WHERE f.DT_ARR = DATE '2026-09-30') AS au_dernier_arrete,
       SUM(f.MT_CRD_RST)                                             AS toutes_photos_sommees
FROM   F_CRD_MNS f JOIN D_AGE a ON a.ID_AGE = f.ID_AGE
GROUP  BY a.LIB_AGE
ORDER  BY au_dernier_arrete DESC;


-- =====================================================================
-- Q8. Quel est l'age moyen de nos clients emprunteurs ?
--     AMBIGUITE SEMANTIQUE + GRAIN
-- =====================================================================

SELECT 'Q8 - lignes, sans dedoublonner'  AS lecture,
       ROUND(AVG(date_diff('year', c.DT_NAI, DATE '2026-09-30')), 1) AS age_moyen
FROM   F_CRD_MNS f JOIN D_CLI c ON c.ID_CLI = f.ID_CLI
UNION ALL
SELECT 'Q8 - clients ayant eu un credit',
       ROUND(AVG(date_diff('year', c.DT_NAI, DATE '2026-09-30')), 1)
FROM   D_CLI c WHERE c.ID_CLI IN (SELECT ID_CLI FROM F_CRD_MNS)
UNION ALL
SELECT 'Q8 - credit en cours au dernier arrete',
       ROUND(AVG(date_diff('year', c.DT_NAI, DATE '2026-09-30')), 1)
FROM   D_CLI c WHERE c.ID_CLI IN (SELECT ID_CLI FROM F_CRD_MNS
                                  WHERE DT_ARR = DATE '2026-09-30' AND CD_STA <> 'SO');
-- Le client 6 est une societe : DT_NAI vide, AVG l'ignore sans le dire.


-- =====================================================================
-- Q9. Quelle est la part des credits douteux dans l'encours ?
--     AGREGATION : ratio de sommes ou moyenne de ratios
-- =====================================================================

WITH par_agence AS (
  SELECT ID_AGE,
         SUM(MT_CRD_RST) FILTER (WHERE TOP_DOU = 'O') AS douteux,
         SUM(MT_CRD_RST)                              AS total
  FROM   F_CRD_MNS WHERE DT_ARR = DATE '2026-09-30'
  GROUP  BY ID_AGE
)
SELECT 'Q9 - ratio des sommes'          AS lecture,
       ROUND(100 * SUM(COALESCE(douteux, 0)) / SUM(total), 2) AS part_pct
FROM   par_agence
UNION ALL
SELECT 'Q9 - moyenne des ratios d''agence',
       ROUND(100 * AVG(COALESCE(douteux, 0) / total), 2)
FROM   par_agence;


-- =====================================================================
-- Q10. Combien de clients ont quitte la banque ce trimestre ?
--      AMBIGUITE SEMANTIQUE
-- =====================================================================

SELECT 'Q10 - DT_SOR dans le trimestre'       AS definition, COUNT(*) AS nb_clients
FROM   D_CLI WHERE DT_SOR BETWEEN DATE '2026-07-01' AND DATE '2026-09-30'
UNION ALL
SELECT 'Q10 - dernier compte clos ce trimestre', COUNT(*)
FROM  (SELECT ID_CLI FROM D_CPT GROUP BY ID_CLI
       HAVING COUNT(*) = COUNT(DT_CLO)
          AND MAX(DT_CLO) BETWEEN DATE '2026-07-01' AND DATE '2026-09-30');


-- =====================================================================
-- Q11 et Q12. Satisfaction par agence, canal de souscription
--             DONNEE INEXISTANTE
-- =====================================================================

-- On cherche une colonne qui ressemble a une satisfaction ou a un canal.
SELECT table_name, column_name
FROM   information_schema.columns
WHERE  regexp_matches(column_name, 'SAT|NPS|NOTE|CAN|CNL|CHN', 'i');
-- Zero ligne : aucune requete, si habile soit-elle, ne fabriquera ce chiffre.
