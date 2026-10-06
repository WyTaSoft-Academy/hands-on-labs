-- =====================================================================
-- SOCLE : l'entrepot tel qu'il est.
--
-- Version FORMATEUR : les defauts sont commentes au-dessus de chaque
-- table. Au lancement du TP 1, distribuer modele-socle-participant.sql,
-- qui ne porte que les noms, les types et quelques valeurs de codes.
-- Celle-ci se distribue apres la restitution.
--
-- Modele de demonstration d'une banque de detail fictive. Il est
-- volontairement ORDINAIRE : ni caricatural, ni exemplaire. Chacun de
-- ses defauts se rencontre en production, et aucun n'est une faute
-- professionnelle -- ce sont des choix qui avaient un sens pour
-- alimenter et stocker, et qui ne tiennent plus des qu'une machine
-- doit comprendre le modele sans qu'on le lui explique.
--
-- Aucune donnee reelle. Toute ressemblance avec un systeme existant
-- serait une coincidence -- ou la preuve que le probleme est repandu.
--
-- SQL volontairement standard : il se lit, il n'a pas a s'executer.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Faits : encours de credit, photographies mensuelles
-- ---------------------------------------------------------------------
-- DEFAUT 1 : le grain n'est ecrit nulle part. Une ligne vaut un credit
--            ET un mois d'arrete. Sommer MT_CRD_RST sur douze mois
--            multiplie l'encours par douze, sans erreur technique.
-- DEFAUT 2 : trois colonnes de date, aucune declaree comme celle qui
--            fait foi. DT_INS n'a aucun sens metier.
-- DEFAUT 3 : TX_NOM est un taux. Il ne se somme jamais, et sa moyenne
--            simple est fausse des que les credits ont des montants
--            differents. Rien ne le signale.
-- DEFAUT 4 : les credits soldes restent dans la table (CD_STA). Qui ne
--            le sait pas compte l'encours des credits deja rembourses.
CREATE TABLE F_CRD_MNS (
  ID_CRD       NUMBER(12)     NOT NULL,
  ID_CLI       NUMBER(12)     NOT NULL,
  ID_AGE       NUMBER(6)      NOT NULL,
  CD_PRD       VARCHAR(12)    NOT NULL,
  DT_ARR       DATE           NOT NULL,   -- date d'arrete
  DT_DEB       DATE,                      -- date de deblocage du credit
  DT_INS       TIMESTAMP,                 -- date de chargement (technique)
  MT_OCT       NUMBER(18,2),              -- montant octroye a l'origine
  MT_CRD_RST   NUMBER(18,2),              -- capital restant du
  MT_ECH       NUMBER(18,2),              -- montant de l'echeance du mois
  TX_NOM       NUMBER(5,4),               -- taux nominal
  CD_STA       VARCHAR(2),                -- AC, SO, CT
  TOP_DOU      CHAR(1)                    -- O / N
);


-- ---------------------------------------------------------------------
-- Faits : operations sur les comptes
-- ---------------------------------------------------------------------
-- DEFAUT 5 : DT_OPE et DT_CPT different, parfois de plusieurs jours.
--            « le mois dernier » ne designe aucune des deux en
--            particulier, et les deux donnent des totaux differents.
-- DEFAUT 6 : CD_TYP est un code sans table de libelles. VIR, PRL, CB,
--            CHQ -- il faut deja connaitre pour interroger.
CREATE TABLE F_OPE (
  ID_OPE       NUMBER(15)     NOT NULL,
  ID_CPT       NUMBER(12)     NOT NULL,
  DT_OPE       DATE           NOT NULL,   -- date de l'operation
  DT_CPT       DATE,                      -- date de comptabilisation
  MT_OPE       NUMBER(18,2),
  SNS          CHAR(1),                   -- D / C
  CD_TYP       VARCHAR(4)
);


-- ---------------------------------------------------------------------
-- Dimension : clients
-- ---------------------------------------------------------------------
-- DEFAUT 7 : TOP_ACT vaut O ou N. Nulle part n'est ecrit ce qui rend
--            un client actif. Trois directions en ont trois definitions
--            et toutes les trois lisent cette meme colonne.
-- DEFAUT 8 : CD_SEG est un code (PA, PR, PE) sans libelle.
-- DEFAUT 9 : CD_AGE_RAT est l'agence de rattachement du CLIENT, qui
--            peut differer de l'agence du CREDIT. Deux chemins, deux
--            totaux, aucun signalement.
CREATE TABLE D_CLI (
  ID_CLI       NUMBER(12)     NOT NULL,
  NOM          VARCHAR(80),
  DT_NAI       DATE,
  CD_SEG       VARCHAR(4),                -- PA, PR, PE
  CD_AGE_RAT   NUMBER(6),
  TOP_ACT      CHAR(1),                   -- O / N
  DT_ENT       DATE,                      -- entree en relation
  DT_SOR       DATE                       -- sortie, NULL si toujours client
);


-- ---------------------------------------------------------------------
-- Dimension : comptes
-- ---------------------------------------------------------------------
-- DEFAUT 10 : SLD est un solde SANS DATE. C'est une photo dont on ignore
--             la date. Toute question sur l'evolution d'un solde est
--             sans reponse, et rien ne le dit.
CREATE TABLE D_CPT (
  ID_CPT       NUMBER(12)     NOT NULL,
  ID_CLI       NUMBER(12)     NOT NULL,
  CD_TYP_CPT   VARCHAR(4),                -- CCO, LVA, PEL, CAT
  DT_OUV       DATE,
  DT_CLO       DATE,
  SLD          NUMBER(18,2)
);


-- ---------------------------------------------------------------------
-- Dimension : agences
-- ---------------------------------------------------------------------
-- DEFAUT 11 : la region n'existe qu'ici. Une question « par region »
--             passe donc forcement par l'agence -- celle du credit ou
--             celle du client, au choix du moteur.
CREATE TABLE D_AGE (
  ID_AGE       NUMBER(6)      NOT NULL,
  LIB_AGE      VARCHAR(60),
  CD_REG       VARCHAR(4),
  CD_DEP       VARCHAR(3)
);


-- ---------------------------------------------------------------------
-- Dimension : produits
-- ---------------------------------------------------------------------
-- DEFAUT 12 : la hierarchie existe en codes (CD_FAM > CD_SFAM > CD_PRD)
--             mais aucun niveau n'a de libelle lisible. « les credits
--             immobiliers » ne correspond a aucune valeur de la table.
CREATE TABLE D_PRD (
  CD_PRD       VARCHAR(12)    NOT NULL,
  LIB_PRD      VARCHAR(60),
  CD_SFAM      VARCHAR(8),                -- IMMO, CONSO, TRESO
  CD_FAM       VARCHAR(8)                 -- PART, PRO
);


-- =====================================================================
-- Ce que le modele NE CONTIENT PAS -- et qui compte autant.
--
--   - aucun canal de souscription (agence, en ligne, courtier)
--   - aucune donnee de satisfaction client
--   - aucune definition de mesure, nulle part
--   - aucun commentaire de colonne dans le catalogue
--
-- Les deux premieres absences rendent deux des douze questions du
-- TP 1 sans reponse possible. Aucune couche semantique n'y changera
-- quoi que ce soit : on ne decrit pas une donnee qui n'existe pas.
-- =====================================================================
