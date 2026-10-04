-- =====================================================================
-- SOCLE : l'entrepot tel qu'il est.
--
-- Version PARTICIPANT, a distribuer au lancement du TP 1.
--
-- Vous avez les noms, les types et quelques valeurs observees dans les
-- colonnes de codes. Rien d'autre : pas de dictionnaire, pas de
-- commentaire de colonne. C'est exactement ce que voit un moteur NLQ.
--
-- Banque de detail fictive. Aucune donnee reelle.
-- SQL volontairement standard : il se lit, il n'a pas a s'executer.
-- =====================================================================


CREATE TABLE F_CRD_MNS (
  ID_CRD       NUMBER(12)     NOT NULL,
  ID_CLI       NUMBER(12)     NOT NULL,
  ID_AGE       NUMBER(6)      NOT NULL,
  CD_PRD       VARCHAR(12)    NOT NULL,
  DT_ARR       DATE           NOT NULL,
  DT_DEB       DATE,
  DT_INS       TIMESTAMP,
  MT_OCT       NUMBER(18,2),
  MT_CRD_RST   NUMBER(18,2),
  MT_ECH       NUMBER(18,2),
  TX_NOM       NUMBER(5,4),
  CD_STA       VARCHAR(2),                -- valeurs : AC, SO, CT
  TOP_DOU      CHAR(1)                    -- valeurs : O, N
);


CREATE TABLE F_OPE (
  ID_OPE       NUMBER(15)     NOT NULL,
  ID_CPT       NUMBER(12)     NOT NULL,
  DT_OPE       DATE           NOT NULL,
  DT_CPT       DATE,
  MT_OPE       NUMBER(18,2),
  SNS          CHAR(1),                   -- valeurs : D, C
  CD_TYP       VARCHAR(4)                 -- valeurs : VIR, PRL, CB, CHQ
);


CREATE TABLE D_CLI (
  ID_CLI       NUMBER(12)     NOT NULL,
  NOM          VARCHAR(80),
  DT_NAI       DATE,
  CD_SEG       VARCHAR(4),                -- valeurs : PA, PR, PE
  CD_AGE_RAT   NUMBER(6),
  TOP_ACT      CHAR(1),                   -- valeurs : O, N
  DT_ENT       DATE,
  DT_SOR       DATE
);


CREATE TABLE D_CPT (
  ID_CPT       NUMBER(12)     NOT NULL,
  ID_CLI       NUMBER(12)     NOT NULL,
  CD_TYP_CPT   VARCHAR(4),                -- valeurs : CCO, LVA, PEL, CAT
  DT_OUV       DATE,
  DT_CLO       DATE,
  SLD          NUMBER(18,2)
);


CREATE TABLE D_AGE (
  ID_AGE       NUMBER(6)      NOT NULL,
  LIB_AGE      VARCHAR(60),
  CD_REG       VARCHAR(4),
  CD_DEP       VARCHAR(3)
);


CREATE TABLE D_PRD (
  CD_PRD       VARCHAR(12)    NOT NULL,
  LIB_PRD      VARCHAR(60),
  CD_SFAM      VARCHAR(8),                -- valeurs : IMMO, CONSO, TRESO
  CD_FAM       VARCHAR(8)                 -- valeurs : PART, PRO
);
