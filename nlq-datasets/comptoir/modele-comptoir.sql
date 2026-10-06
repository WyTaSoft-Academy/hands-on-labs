-- =====================================================================
-- COMPTOIR : le meme contenu, rendu interrogeable.
--
-- Ce n'est pas une refonte de l'entrepot. SOCLE reste en place, et
-- continue d'alimenter ce qu'il alimente. COMPTOIR est une couche
-- au-dessus : memes donnees, autres noms, et surtout du sens ecrit.
--
-- Deux tables de faits, quatre dimensions : autant de tables que SOCLE,
-- mais MOINS de colonnes, volontairement. Ni nom de client, ni date de
-- naissance, ni solde sans date, ni colonne technique : ce qu'on ne sait
-- pas decrire en une phrase ne sort pas au comptoir.
--
-- Aucune source n'est touchee. Quelques colonnes sont calculees ici,
-- au-dessus de SOCLE : age, est_client_actif, est_emprunteur.
-- =====================================================================


-- ---------------------------------------------------------------------
-- GRAIN : une ligne = UN CREDIT x UN MOIS D'ARRETE.
--
-- C'est la phrase la plus importante du fichier. Elle est repetee dans
-- le commentaire de table du catalogue, et dans le modele semantique.
-- ---------------------------------------------------------------------
CREATE TABLE encours_credit_mensuel (
  credit_id              NUMBER(12)   NOT NULL,
  client_id              NUMBER(12)   NOT NULL,
  agence_id              NUMBER(6)    NOT NULL,   -- agence qui PORTE le credit
  produit_code           VARCHAR(12)  NOT NULL,

  date_arrete            DATE         NOT NULL,   -- LA date de reference
  date_deblocage         DATE,                    -- utilisee pour la production

  capital_restant_du     NUMBER(18,2),            -- STOCK  : jamais somme sur le temps
  montant_echeance       NUMBER(18,2),            -- FLUX   : additif partout
  montant_octroye        NUMBER(18,2),            -- constant par credit, cf. note
  taux_nominal           NUMBER(5,4),             -- RATIO  : jamais somme, pondere

  statut_credit          VARCHAR(12),             -- ACTIF / SOLDE / CONTENTIEUX
  est_douteux            BOOLEAN
);
COMMENT ON TABLE encours_credit_mensuel IS
  'Photographie mensuelle des credits. Une ligne = un credit x un mois d''arrete.
   capital_restant_du est un stock : il se somme entre credits, jamais entre mois.
   montant_octroye est constant sur toutes les lignes d''un meme credit : ne jamais
   le sommer sur cette table, utiliser la mesure production_credit.';

-- DT_INS, MT_OCT duplique, CD_STA code : retires ou renommes.
-- Ce qui est technique reste dans l'etage prepare, il ne sort pas ici.


-- ---------------------------------------------------------------------
-- GRAIN : une ligne = UNE OPERATION.
-- ---------------------------------------------------------------------
CREATE TABLE operation_compte (
  operation_id           NUMBER(15)   NOT NULL,
  compte_id              NUMBER(12)   NOT NULL,   -- cle de comptage ; il n'existe pas de dim_compte, voir plus bas
  client_id              NUMBER(12)   NOT NULL,   -- denormalise : evite une jointure

  date_operation         DATE         NOT NULL,   -- LA date de reference
  date_comptabilisation  DATE,                    -- explicitement nommee

  montant                NUMBER(18,2),            -- FLUX, signe : voir la mesure nombre_operations
  sens                   VARCHAR(6),              -- DEBIT / CREDIT
  type_operation         VARCHAR(20),             -- Virement / Prelevement / Carte / Cheque
  type_compte            VARCHAR(30)              -- Compte courant / Livret A / PEL / Compte a terme
);
COMMENT ON TABLE operation_compte IS
  'Une ligne = une operation. Date de reference : date_operation.
   date_comptabilisation existe pour les besoins comptables et doit etre
   demandee explicitement.';
COMMENT ON COLUMN operation_compte.type_compte IS
  'Nature du compte sur lequel porte l''operation, denormalisee depuis D_CPT
   (CCO / LVA / PEL / CAT). C''est ce qui permet a une question de dire
   « les comptes courants ». A ne pas confondre avec type_operation, qui dit
   ce qui a ete fait, pas sur quoi.';
COMMENT ON COLUMN operation_compte.compte_id IS
  'Identifiant du compte, conserve pour compter des comptes distincts.
   D_CPT n''est PAS exposee au comptoir : la seule information qu''elle portait
   en propre est un solde sans date, declare en absence. Ce qui restait d''utile
   (la nature du compte) est denormalise ici, dans type_compte.';


-- ---------------------------------------------------------------------
-- Dimension client : les codes deviennent des libelles.
--
-- GRAIN : une ligne = UN CLIENT, dans son etat courant.
--
-- Cette dimension n'est PAS historisee, et ce n'est pas un oubli : D_CLI
-- ne porte aucune date sur TOP_ACT. L'historiser reviendrait a fabriquer
-- un passe que les sources ne contiennent pas -- exactement ce que le TP
-- interdit. On ecrase donc, et on le DECLARE : les deux drapeaux calcules
-- valent a la date du dernier arrete charge, et toute question portant
-- sur une date passee doit etre refusee plutot qu'approchee.
-- Voir absences_declarees : « statut client a une date passee ».
-- ---------------------------------------------------------------------
CREATE TABLE dim_client (
  client_id              NUMBER(12)   NOT NULL,
  segment                VARCHAR(30),             -- Particulier / Professionnel / Patrimonial
  date_entree_relation   DATE,
  date_sortie_relation   DATE,
  agence_rattachement_id NUMBER(6),               -- nom explicite : ce n'est PAS l'agence du credit
  age                    NUMBER(3),               -- calcule, evite d'exposer la date de naissance
  est_client_actif       BOOLEAN,                 -- etat courant, non historise
  est_emprunteur         BOOLEAN                  -- etat courant, non historise
);
COMMENT ON TABLE dim_client IS
  'Une ligne = un client, dans son etat courant. Dimension NON historisee :
   les valeurs decrivent le dernier arrete charge, et rien d''autre. Une question
   portant sur une date passee (« combien de clients actifs en mars ? ») n''a pas
   de reponse ici, et doit etre refusee.';
COMMENT ON COLUMN dim_client.est_client_actif IS
  'Client detenant au moins un produit non clos ET ayant eu au moins une operation
   dans les 90 jours precedant le dernier arrete charge. Definition validee par la
   Direction Commerciale le 15/01/2026. Toute autre definition doit etre demandee
   explicitement. Etat courant : ce drapeau ne dit pas si le client etait actif
   a une date passee.';
COMMENT ON COLUMN dim_client.est_emprunteur IS
  'Client portant au moins un credit non solde au dernier arrete charge. Un client
   dont tous les credits sont soldes n''est plus un emprunteur. Etat courant,
   non historise, comme est_client_actif.';


-- ---------------------------------------------------------------------
-- Dimension produit : la hierarchie, denormalisee, avec des libelles.
-- ---------------------------------------------------------------------
CREATE TABLE dim_produit (
  produit_code           VARCHAR(12)  NOT NULL,
  produit                VARCHAR(60),             -- "Pret a taux zero"
  sous_famille           VARCHAR(40),             -- "Immobilier"
  famille                VARCHAR(40),             -- "Credit aux particuliers"
  segment_produit        VARCHAR(30),             -- "Particuliers"
  est_reglemente         BOOLEAN                  -- attribut metier ajoute au comptoir
);


-- ---------------------------------------------------------------------
-- Dimension agence : la hierarchie geographique, avec des libelles.
-- ---------------------------------------------------------------------
CREATE TABLE dim_agence (
  agence_id              NUMBER(6)    NOT NULL,
  agence                 VARCHAR(60),
  departement            VARCHAR(40),
  region                 VARCHAR(40),
  zone_commerciale       VARCHAR(40)
);


-- ---------------------------------------------------------------------
-- Dimension temps : explicite plutot que calculee a la volee.
-- ---------------------------------------------------------------------
CREATE TABLE dim_date (
  date_jour              DATE         NOT NULL,
  mois                   VARCHAR(7),              -- 2026-06
  libelle_mois           VARCHAR(20),             -- "juin 2026"
  trimestre              VARCHAR(7),              -- 2026-T2
  annee                  NUMBER(4),
  est_fin_de_mois        BOOLEAN,
  est_dernier_arrete     BOOLEAN                  -- repond a "au dernier arrete"
);


-- =====================================================================
-- Ce qui n'est toujours pas la, et qui ne peut pas l'etre :
--
--   - la satisfaction client : aucune source ne la produit
--   - le canal de souscription : l'information n'est pas collectee
--   - le solde des comptes historise : SOCLE n'a qu'un solde sans date,
--     il ne sort pas au comptoir tant qu'il n'est pas historise
--
-- Ces trois absences sont DOCUMENTEES dans le modele semantique, pour
-- que le moteur reponde « je n'ai pas cette information » au lieu
-- d'approcher avec ce qui lui ressemble.
-- =====================================================================
