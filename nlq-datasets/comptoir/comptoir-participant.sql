-- =====================================================================
-- COMPTOIR : a vous de l'ecrire.
--
-- Version PARTICIPANT, a distribuer au lancement du TP 2.
-- Elle couvre les etapes 1 et 2 de l'enonce. Les mesures sont dans
-- l'autre fichier : mesures-participant.yaml.
--
-- Le squelette est deja pose : deux tables de faits, quatre dimensions,
-- autant de tables que SOCLE. Une partie des colonnes est deja renommee,
-- pour vous laisser le temps de travailler sur celles qui comptent.
--
-- Ce qui reste a faire est marque << ainsi >>. Vous ecrivez du texte,
-- pas du code : rien ici ne s'execute, et personne ne compilera ce
-- fichier. Ce qui est evalue, c'est ce que vous decidez.
--
-- Rappel de l'etape 1 : un nom qui demande d'etre initie n'est pas un
-- nom. Un moteur NLQ lit ces mots-la, et rien d'autre.
-- =====================================================================


-- ---------------------------------------------------------------------
-- FAIT 1 : la photo mensuelle des credits (SOCLE : F_CRD_MNS)
--
-- Le test du grain : prenez une ligne au hasard et lisez-la a voix
-- haute en commencant par « ceci est un... ». Si la phrase ne se
-- termine pas naturellement, le grain n'est pas clair.
-- ---------------------------------------------------------------------
CREATE TABLE encours_credit_mensuel (
  credit_id              NUMBER(12)   NOT NULL,
  client_id              NUMBER(12)   NOT NULL,
  agence_id              NUMBER(6)    NOT NULL,   -- SOCLE : ID_AGE, l'agence PORTEUSE du credit
  produit_code           VARCHAR(12)  NOT NULL,

  date_arrete            DATE         NOT NULL,   -- SOCLE : DT_ARR
  << DT_DEB : gardee ? renommee comment ? >>
  << DT_INS : que devient-elle au comptoir ? >>

  << MT_OCT : nom ? et attention, elle est repetee sur chaque mois >>
  capital_restant_du     NUMBER(18,2),            -- SOCLE : MT_CRD_RST
  << MT_ECH : nom ? >>
  << TX_NOM : nom ? >>

  << CD_STA : les valeurs AC / SO / CT restent-elles des codes ? >>
  << TOP_DOU : O / N. Un nom qui se lise, et un type qui se lise >>
);

COMMENT ON TABLE encours_credit_mensuel IS
  '<< LE GRAIN, EN UNE PHRASE. C''est la ligne la plus importante du fichier. >>';


-- ---------------------------------------------------------------------
-- FAIT 2 : les operations sur les comptes (SOCLE : F_OPE)
--
-- Deux dates candidates. Une seule fait foi ; l'autre doit pouvoir
-- etre demandee explicitement, sans jamais etre choisie par defaut.
-- ---------------------------------------------------------------------
CREATE TABLE operation_compte (
  operation_id           NUMBER(15)   NOT NULL,
  compte_id              NUMBER(12)   NOT NULL,
  << de quelle dimension compte_id est-il la cle ? que faut-il exposer
     pour qu'une question puisse dire « les comptes courants » ? >>

  << DT_OPE et DT_CPT : laquelle fait foi, et comment nommer l'autre ? >>

  << MT_OPE : nom ? >>
  << SNS : D / C. Un nom, et des valeurs qui se lisent >>
  << CD_TYP : le code ne se lit pas. Que faut-il exposer a la place ? >>
);

COMMENT ON TABLE operation_compte IS
  '<< LE GRAIN, EN UNE PHRASE. >>';


-- ---------------------------------------------------------------------
-- DIMENSION client (SOCLE : D_CLI)
--
-- Deux colonnes calculees vous sont offertes : elles n'existent dans
-- aucune source, et le comptoir a le droit de les ajouter. A vous de
-- dire ce qu'elles signifient exactement, dans le commentaire.
--
-- La question qui se pose avant de les ecrire : A QUELLE DATE valent
-- ces deux drapeaux ? Regardez ce que D_CLI porte comme date sur
-- TOP_ACT avant de repondre, et ecrivez le grain de la table.
-- ---------------------------------------------------------------------
CREATE TABLE dim_client (
  client_id              NUMBER(12)   NOT NULL,
  << CD_SEG : PA / PR / PE. Code ou libelle ? >>
  date_entree_relation   DATE,                    -- SOCLE : DT_ENT
  date_sortie_relation   DATE,                    -- SOCLE : DT_SOR
  << CD_AGE_RAT : ce n'est PAS l'agence du credit. Le nom doit le dire >>
  << NOM, DT_NAI : que sort-il au comptoir, et sous quelle forme ? >>

  est_client_actif       BOOLEAN,                 -- calculee : remplace TOP_ACT
  est_emprunteur         BOOLEAN                  -- calculee
);

COMMENT ON TABLE dim_client IS
  '<< LE GRAIN. Une ligne = un client... a quelle date ? Si la source ne date
      rien, dites-le ici plutot que d''inventer un historique. >>';

COMMENT ON COLUMN dim_client.est_client_actif IS
  '<< LA definition, celle qui sera opposable. Qui l''a validee, et quand ? >>';

COMMENT ON COLUMN dim_client.est_emprunteur IS
  '<< Un client dont tous les credits sont soldes en est-il un ? >>';


-- ---------------------------------------------------------------------
-- DIMENSION produit (SOCLE : D_PRD)
--
-- Etape 2 : la hierarchie a plat. Trois niveaux, en colonnes, avec des
-- libelles. « Immobilier » doit devenir une valeur qu'une question
-- puisse trouver.
-- ---------------------------------------------------------------------
CREATE TABLE dim_produit (
  produit_code           VARCHAR(12)  NOT NULL,   -- SOCLE : CD_PRD, ex. IMMO_PTZ
  << le libelle du produit : LIB_PRD vaut « PTZ ». Suffisant ? >>
  << CD_SFAM : IMMO / CONSO / TRESO >>
  << CD_FAM  : PART / PRO >>
  << un attribut metier que les sources ne portent pas, si vous en
     voyez un d'utile. Le comptoir est un produit, pas un miroir >>
);


-- ---------------------------------------------------------------------
-- DIMENSION agence (SOCLE : D_AGE)
-- ---------------------------------------------------------------------
CREATE TABLE dim_agence (
  agence_id              NUMBER(6)    NOT NULL,   -- SOCLE : ID_AGE
  agence                 VARCHAR(60),             -- SOCLE : LIB_AGE
  << CD_REG, CD_DEP : des codes. Une question dit « en Bretagne » >>
);


-- ---------------------------------------------------------------------
-- DIMENSION date
--
-- Facultative, et utile : elle porte le calendrier (mois, trimestre,
-- annee) pour que « le trimestre dernier » ait une definition ecrite
-- plutot que calculee a la volee par le moteur.
-- ---------------------------------------------------------------------
CREATE TABLE dim_date (
  date_jour              DATE         NOT NULL
  << ce dont une question a besoin pour dire « le mois dernier » >>
);


-- =====================================================================
-- AVANT DE PASSER A L'ETAPE 3
--
-- [ ] Les deux tables de faits ont leur grain ecrit en toutes lettres.
-- [ ] Chaque table de faits a UNE date de reference, et les autres
--     dates portent un nom qui interdit de les confondre.
-- [ ] Aucune colonne technique ne sort au comptoir.
-- [ ] Aucune colonne ne reste qu'on ne sache pas decrire en une phrase.
-- [ ] Les hierarchies sont a plat, en libelles.
-- [ ] Chaque table de faits exposee aura au moins UNE mesure certifiee
--     a l'etape 3. Une table sans mesure est une table que chaque
--     question agregera a sa facon.
--
-- Ce qui n'a pas de source dans SOCLE ne s'invente pas : cela se
-- declare en absence, dans mesures-participant.yaml. Une dimension
-- qu'aucune source ne date n'est pas historisable : elle se declare.
-- =====================================================================
