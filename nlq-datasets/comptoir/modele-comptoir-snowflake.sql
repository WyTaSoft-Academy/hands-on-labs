-- =====================================================================
-- COMPTOIR dans Snowflake : le corrige du TP 2, executable.
--
-- Version FORMATEUR. A ne consulter qu'APRES la restitution du TP 2,
-- comme modele-comptoir.sql et mesures-comptoir.yaml, dont il est la
-- traduction. Les decisions sont celles de tp2-corrige.md ; ce fichier
-- montre ou chacune s'ecrit dans Snowflake.
--
-- Trois parties, a executer dans l'ordre, dans le schema ou
-- socle/socle-donnees-snowflake.sql a ete charge :
--
--   1. Les six vues COMPTOIR, au-dessus de SOCLE : noms lisibles,
--      grain ecrit, codes devenus libelles. SOCLE n'est pas touche.
--   2. La vue semantique COMPTOIR_SV : les huit mesures certifiees,
--      les absences declarees, les questions validees.
--   3. Les douze questions, rejouees : le SQL de reference sur les
--      vues, puis la meme question posee a la vue semantique.
--
-- Parties 1 et 3 (SQL de reference) : verifiees sur les memes donnees
-- dans DuckDB. Parties 2 et 3 (SEMANTIC_VIEW) : ecrites d'apres la
-- documentation CREATE SEMANTIC VIEW d'octobre 2026, NON EXECUTEES.
-- Les tester sur le compte avant le jour 4 : voir la liste en fin de
-- fichier.
-- =====================================================================


-- =====================================================================
-- PARTIE 1 -- Les six vues COMPTOIR
-- =====================================================================

-- ---------------------------------------------------------------------
-- GRAIN : une ligne = UN CREDIT x UN MOIS D'ARRETE.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW ENCOURS_CREDIT_MENSUEL (
  credit_id,
  client_id,
  agence_id           COMMENT 'Agence qui PORTE le credit. Ce n''est pas l''agence de rattachement du client.',
  produit_code,
  date_arrete         COMMENT 'Dernier jour du mois. LA date de reference de la table.',
  date_deblocage      COMMENT 'Date de deblocage du credit. Date de reference de la production, pas de l''encours.',
  capital_restant_du  COMMENT 'STOCK, en euros : se somme entre credits, jamais entre mois.',
  montant_echeance    COMMENT 'FLUX, en euros : echeance du mois, additive partout.',
  montant_octroye     COMMENT 'Constant sur toutes les lignes d''un meme credit. Ne jamais le sommer ici : utiliser la mesure production_credit.',
  taux_nominal        COMMENT 'RATIO : jamais somme, jamais moyenne simple. Utiliser taux_moyen_pondere.',
  statut_credit       COMMENT 'ACTIF, SOLDE ou CONTENTIEUX, a la date d''arrete.',
  est_douteux         COMMENT 'Vrai si le credit est classe douteux a la date d''arrete.'
)
COMMENT = 'Photographie mensuelle des credits. Une ligne = un credit x un mois d''arrete. capital_restant_du est un stock : il se somme entre credits, jamais entre mois.'
AS
SELECT
  ID_CRD,
  ID_CLI,
  ID_AGE,
  CD_PRD,
  DT_ARR,
  DT_DEB,
  MT_CRD_RST,
  MT_ECH,
  MT_OCT,
  TX_NOM,
  CASE CD_STA WHEN 'AC' THEN 'ACTIF'
              WHEN 'SO' THEN 'SOLDE'
              WHEN 'CT' THEN 'CONTENTIEUX' END,
  TOP_DOU = 'O'
FROM F_CRD_MNS;
-- Retires : DT_INS (technique), et le code CD_STA, devenu un libelle.


-- ---------------------------------------------------------------------
-- GRAIN : une ligne = UNE OPERATION.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW OPERATION_COMPTE (
  operation_id,
  compte_id             COMMENT 'Identifiant du compte, garde pour compter des comptes distincts. D_CPT n''est pas exposee : son seul attribut propre est un solde sans date.',
  client_id             COMMENT 'Client titulaire du compte, denormalise pour eviter une jointure.',
  date_operation        COMMENT 'LA date de reference de la table.',
  date_comptabilisation COMMENT 'Date comptable. A n''utiliser que si la question la demande explicitement.',
  montant               COMMENT 'Signe : negatif au debit, positif au credit. Ne jamais le sommer sans filtre sur le sens.',
  sens                  COMMENT 'DEBIT ou CREDIT.',
  type_operation        COMMENT 'Ce qui a ete fait : Virement, Prelevement, Carte, Cheque.',
  type_compte           COMMENT 'Sur quel compte : Compte courant, Livret A, PEL, Compte a terme. Ne pas confondre avec type_operation.'
)
COMMENT = 'Une ligne = une operation. Date de reference : date_operation. date_comptabilisation doit etre demandee explicitement.'
AS
SELECT
  o.ID_OPE,
  o.ID_CPT,
  k.ID_CLI,
  o.DT_OPE,
  o.DT_CPT,
  IFF(o.SNS = 'D', -o.MT_OPE, o.MT_OPE),
  CASE o.SNS WHEN 'D' THEN 'DEBIT' WHEN 'C' THEN 'CREDIT' END,
  CASE o.CD_TYP WHEN 'VIR' THEN 'Virement'
                WHEN 'PRL' THEN 'Prélèvement'
                WHEN 'CB'  THEN 'Carte'
                WHEN 'CHQ' THEN 'Chèque' END,
  CASE k.CD_TYP_CPT WHEN 'CCO' THEN 'Compte courant'
                    WHEN 'LVA' THEN 'Livret A'
                    WHEN 'PEL' THEN 'PEL'
                    WHEN 'CAT' THEN 'Compte à terme' END
FROM F_OPE o
JOIN D_CPT k ON k.ID_CPT = o.ID_CPT;


-- ---------------------------------------------------------------------
-- GRAIN : une ligne = UN CLIENT, dans son etat courant.
--
-- Dimension NON historisee, et c'est declare : D_CLI ne date pas
-- TOP_ACT. Les trois colonnes calculees valent au dernier arrete
-- charge, et a aucune autre date. Ni nom ni date de naissance : l'age
-- suffit aux questions, et rien de nominatif ne sort au comptoir.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW DIM_CLIENT (
  client_id,
  segment                 COMMENT 'Particulier, Professionnel ou Entreprise.',
  date_entree_relation,
  date_sortie_relation    COMMENT 'Renseignee par une regle qui n''est ecrite nulle part : ne pas l''utiliser pour compter les departs (question 10).',
  agence_rattachement_id  COMMENT 'Agence de RATTACHEMENT du client. Ce n''est PAS l''agence qui porte ses credits.',
  age                     COMMENT 'Age en annees au dernier arrete charge.',
  est_client_actif        COMMENT 'Au moins un produit non clos ET au moins une operation dans les 90 jours precedant le dernier arrete charge. Definition validee par la Direction Commerciale le 15/01/2026. Etat courant, non historise.',
  est_emprunteur          COMMENT 'Au moins un credit non solde au dernier arrete charge. Etat courant, non historise.'
)
COMMENT = 'Une ligne = un client, dans son etat courant. Dimension NON historisee : une question sur une date passee (« combien de clients actifs en mars ? ») n''a pas de reponse ici et doit etre refusee.'
AS
WITH dernier AS (
  SELECT MAX(DT_ARR) AS d FROM F_CRD_MNS
),
credits_vivants AS (                      -- credits non soldes au dernier arrete
  SELECT DISTINCT f.ID_CLI
  FROM F_CRD_MNS f JOIN dernier ON f.DT_ARR = dernier.d
  WHERE f.CD_STA <> 'SO'
),
comptes_ouverts AS (
  SELECT DISTINCT ID_CLI FROM D_CPT WHERE DT_CLO IS NULL
),
operations_90j AS (
  SELECT DISTINCT k.ID_CLI
  FROM F_OPE o
  JOIN D_CPT k ON k.ID_CPT = o.ID_CPT
  JOIN dernier ON o.DT_OPE >  DATEADD(day, -90, dernier.d)
              AND o.DT_OPE <= dernier.d
)
SELECT
  c.ID_CLI,
  CASE c.CD_SEG WHEN 'PA' THEN 'Particulier'
                WHEN 'PR' THEN 'Professionnel'
                WHEN 'PE' THEN 'Entreprise' END,
  c.DT_ENT,
  c.DT_SOR,
  c.CD_AGE_RAT,
  FLOOR(DATEDIFF(month, c.DT_NAI, dernier.d) / 12),
  (cv.ID_CLI IS NOT NULL OR co.ID_CLI IS NOT NULL) AND o9.ID_CLI IS NOT NULL,
  cv.ID_CLI IS NOT NULL
FROM D_CLI c
CROSS JOIN dernier
LEFT JOIN credits_vivants cv ON cv.ID_CLI = c.ID_CLI
LEFT JOIN comptes_ouverts co ON co.ID_CLI = c.ID_CLI
LEFT JOIN operations_90j  o9 ON o9.ID_CLI = c.ID_CLI;
-- Decision a faire valider : modele-comptoir.sql liste « Patrimonial »
-- pour le troisieme segment, mais le seul client PE est une SAS. Le
-- libelle d'un code se demande au metier, il ne se devine pas.


-- ---------------------------------------------------------------------
-- La hierarchie produit, denormalisee, avec des libelles.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW DIM_PRODUIT (
  produit_code,
  produit,
  sous_famille     COMMENT 'Immobilier, Consommation ou Trésorerie.',
  famille,
  segment_produit,
  est_reglemente   COMMENT 'Vrai pour les prets reglementes (pret a taux zero).'
)
COMMENT = 'Une ligne = un produit. Hierarchie a plat : produit, sous-famille, famille.'
AS
SELECT
  CD_PRD,
  CASE CD_PRD WHEN 'IMMO-FIX'  THEN 'Prêt habitat à taux fixe'
              WHEN 'IMMO-PTZ'  THEN 'Prêt à taux zéro'
              WHEN 'CONSO-AUT' THEN 'Prêt auto'
              WHEN 'CONSO-PER' THEN 'Prêt personnel'
              WHEN 'TRESO-PRO' THEN 'Crédit de trésorerie'
              ELSE LIB_PRD END,
  CASE CD_SFAM WHEN 'IMMO'  THEN 'Immobilier'
               WHEN 'CONSO' THEN 'Consommation'
               WHEN 'TRESO' THEN 'Trésorerie' END,
  CASE CD_FAM WHEN 'PART' THEN 'Crédit aux particuliers'
              WHEN 'PRO'  THEN 'Crédit aux professionnels' END,
  CASE CD_FAM WHEN 'PART' THEN 'Particuliers'
              WHEN 'PRO'  THEN 'Professionnels' END,
  CD_PRD = 'IMMO-PTZ'
FROM D_PRD;


-- ---------------------------------------------------------------------
-- La hierarchie geographique, avec des libelles.
-- zone_commerciale n'est PAS creee : aucune source ne la porte, et une
-- colonne inventee est pire qu'une colonne absente.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW DIM_AGENCE (
  agence_id,
  agence,
  departement,
  region
)
COMMENT = 'Une ligne = une agence. Sert deux fois dans la vue semantique : agence qui porte le credit, et agence de rattachement du client.'
AS
SELECT
  ID_AGE,
  LIB_AGE,
  CASE CD_DEP WHEN '69' THEN 'Rhône'
              WHEN '38' THEN 'Isère'
              WHEN '75' THEN 'Paris'
              WHEN '92' THEN 'Hauts-de-Seine' END,
  CASE CD_REG WHEN 'ARA' THEN 'Auvergne-Rhône-Alpes'
              WHEN 'IDF' THEN 'Île-de-France' END
FROM D_AGE;


-- ---------------------------------------------------------------------
-- La dimension temps, explicite. Un jour par ligne, de 2019 a 2026.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW DIM_DATE (
  date_jour,
  mois,
  libelle_mois,
  trimestre,
  annee,
  est_fin_de_mois,
  est_dernier_arrete  COMMENT 'Vrai pour le dernier arrete charge : repond a « au dernier arrete ».'
)
COMMENT = 'Une ligne = un jour calendaire, du 1er janvier 2019 au 31 decembre 2026.'
AS
WITH jours AS (
  SELECT DATEADD(day, ROW_NUMBER() OVER (ORDER BY SEQ4()) - 1, '2019-01-01'::DATE) AS d
  FROM TABLE(GENERATOR(ROWCOUNT => 2922))
)
SELECT
  d,
  YEAR(d) || '-' || LPAD(MONTH(d)::VARCHAR, 2, '0'),
  CASE MONTH(d) WHEN 1 THEN 'janvier' WHEN 2 THEN 'février' WHEN 3 THEN 'mars'
                WHEN 4 THEN 'avril' WHEN 5 THEN 'mai' WHEN 6 THEN 'juin'
                WHEN 7 THEN 'juillet' WHEN 8 THEN 'août' WHEN 9 THEN 'septembre'
                WHEN 10 THEN 'octobre' WHEN 11 THEN 'novembre' WHEN 12 THEN 'décembre' END
    || ' ' || YEAR(d),
  YEAR(d) || '-T' || QUARTER(d),
  YEAR(d),
  d = LAST_DAY(d),
  d = (SELECT MAX(DT_ARR) FROM F_CRD_MNS)
FROM jours;


-- Controle : chaque vue repond, et les grains tiennent.
SELECT 'encours_credit_mensuel' AS vue, COUNT(*) AS lignes,
       COUNT(DISTINCT credit_id || '|' || date_arrete) AS cles FROM ENCOURS_CREDIT_MENSUEL
UNION ALL SELECT 'operation_compte', COUNT(*), COUNT(DISTINCT operation_id) FROM OPERATION_COMPTE
UNION ALL SELECT 'dim_client',       COUNT(*), COUNT(DISTINCT client_id)    FROM DIM_CLIENT
UNION ALL SELECT 'dim_produit',      COUNT(*), COUNT(DISTINCT produit_code) FROM DIM_PRODUIT
UNION ALL SELECT 'dim_agence',       COUNT(*), COUNT(DISTINCT agence_id)    FROM DIM_AGENCE
UNION ALL SELECT 'dim_date',         COUNT(*), COUNT(DISTINCT date_jour)    FROM DIM_DATE;
-- Attendu : lignes = cles partout. 302 / 20 / 13 / 5 / 4 / 2922.


-- =====================================================================
-- PARTIE 2 -- La vue semantique COMPTOIR_SV
--
-- Ce que mesures-comptoir.yaml decrivait dans un format neutre, ecrit
-- dans la syntaxe Snowflake. Correspondance des rubriques :
--
--   description, synonymes      -> COMMENT, WITH SYNONYMS
--   famille STOCK               -> NON ADDITIVE BY (date_arrete)
--   famille RATIO               -> numerateur / denominateur dans
--                                  l'expression, ou metrique derivee
--   filtre_implicite            -> dans l'expression de la metrique
--   grain_requis                -> la table logique qui porte la
--                                  metrique (voir age_moyen_emprunteurs)
--   date_reference              -> COMMENT + AI_SQL_GENERATION
--   certifiee_par, revue_le     -> COMMENT (pas de champ dedie)
--   absences_declarees          -> AI_QUESTION_CATEGORIZATION
--   questions_exemple           -> AI_VERIFIED_QUERIES
-- =====================================================================

CREATE OR REPLACE SEMANTIC VIEW COMPTOIR_SV

  TABLES (
    encours AS ENCOURS_CREDIT_MENSUEL
      PRIMARY KEY (credit_id, date_arrete)
      WITH SYNONYMS ('crédits', 'prêts', 'encours mensuel')
      COMMENT = 'Une ligne = un crédit x un mois d''arrêté. Photo mensuelle, pas un historique de mouvements.',
    operations AS OPERATION_COMPTE
      PRIMARY KEY (operation_id)
      WITH SYNONYMS ('opérations', 'mouvements', 'transactions')
      COMMENT = 'Une ligne = une opération. Date de référence : date_operation.',
    clients AS DIM_CLIENT
      PRIMARY KEY (client_id)
      COMMENT = 'Une ligne = un client, dans son état courant. Non historisée.',
    produits AS DIM_PRODUIT
      PRIMARY KEY (produit_code),
    agences AS DIM_AGENCE
      PRIMARY KEY (agence_id)
      COMMENT = 'Agence qui porte le crédit. Sens par défaut de « agence » et de « région ».',
    agences_rattachement AS DIM_AGENCE
      PRIMARY KEY (agence_id)
      COMMENT = 'Agence de rattachement du client. Seulement si la question parle de l''agence du client.'
  )

  RELATIONSHIPS (
    encours_agence     AS encours (agence_id)                REFERENCES agences,
    encours_produit    AS encours (produit_code)             REFERENCES produits,
    encours_client     AS encours (client_id)                REFERENCES clients,
    operation_client   AS operations (client_id)             REFERENCES clients,
    client_rattachement AS clients (agence_rattachement_id)  REFERENCES agences_rattachement
  )

  FACTS (
    encours.capital_restant_du AS capital_restant_du,
    encours.montant_octroye    AS montant_octroye,
    encours.taux_nominal       AS taux_nominal,
    clients.age                AS age
  )

  DIMENSIONS (
    encours.date_arrete AS date_arrete
      WITH SYNONYMS ('date d''arrêté', 'fin de mois', 'situation au', 'au')
      COMMENT = 'Dernier jour du mois. Date de référence de l''encours, du taux et des comptages de crédits.',
    encours.date_deblocage AS date_deblocage
      WITH SYNONYMS ('date de déblocage', 'date de mise en place', 'date d''octroi')
      COMMENT = 'Date de référence de la production.',
    encours.statut_credit AS statut_credit
      COMMENT = 'ACTIF, SOLDE ou CONTENTIEUX.',
    encours.est_douteux AS est_douteux
      WITH SYNONYMS ('douteux', 'CDL', 'créance douteuse'),

    operations.date_operation AS date_operation
      WITH SYNONYMS ('date', 'date d''opération', 'jour de l''opération')
      COMMENT = 'Date de référence des opérations.',
    operations.date_comptabilisation AS date_comptabilisation
      WITH SYNONYMS ('date comptable', 'date de comptabilisation')
      COMMENT = 'À utiliser seulement si la question dit « comptable » ou « comptabilisé ».',
    operations.type_operation AS type_operation
      WITH SYNONYMS ('type d''opération', 'nature d''opération', 'moyen de paiement'),
    operations.type_compte AS type_compte
      WITH SYNONYMS ('type de compte', 'compte courant', 'livret'),
    operations.sens AS sens
      WITH SYNONYMS ('débit', 'crédit', 'sens'),

    clients.segment AS segment
      WITH SYNONYMS ('segment', 'marché', 'clientèle'),

    produits.produit AS produit
      WITH SYNONYMS ('produit', 'type de prêt'),
    produits.sous_famille AS sous_famille
      WITH SYNONYMS ('immobilier', 'immo', 'habitat', 'conso', 'consommation', 'trésorerie'),
    produits.famille AS famille,

    agences.agence AS agence
      WITH SYNONYMS ('agence', 'point de vente')
      COMMENT = 'Agence qui porte le crédit. Sens par défaut de « agence ».',
    agences.region AS region
      WITH SYNONYMS ('région', 'DR', 'direction régionale')
      COMMENT = 'Région de l''agence qui porte le crédit. Sens par défaut de « région ».',
    agences_rattachement.agence_client AS agence
      WITH SYNONYMS ('agence du client', 'agence de rattachement')
      COMMENT = 'Agence de rattachement du client. Jamais pour « agence » seul.',
    agences_rattachement.region_client AS region
      WITH SYNONYMS ('région du client', 'région de rattachement')
      COMMENT = 'Région de l''agence de rattachement du client. Jamais pour « région » seul.'
  )

  METRICS (
    -- STOCK
    encours.encours_credit
      NON ADDITIVE BY (date_arrete)
      AS SUM(IFF(statut_credit <> 'SOLDE', capital_restant_du, 0))
      WITH SYNONYMS ('encours', 'capital restant', 'CRD', 'stock de crédit')
      COMMENT = 'Capital restant dû des crédits non soldés, en euros, à une date d''arrêté. Inclut le contentieux et les douteux : encours brut. N''inclut pas les crédits soldés. Stock : jamais sommé entre mois. Certifiée par la Direction Financière, revue le 15/01/2026.',

    -- FLUX, lu au grain credit : la seule ligne d'un credit dont l'arrete
    -- est la fin du mois de deblocage. Le meme credit ne compte qu'une fois.
    encours.production_credit
      AS SUM(IFF(date_arrete = LAST_DAY(date_deblocage), montant_octroye, 0))
      WITH SYNONYMS ('production', 'nouveaux crédits', 'octrois', 'déblocages')
      COMMENT = 'Montant des crédits débloqués sur la période, en euros, lus à la date de déblocage. Un crédit compte une fois, le mois de son déblocage, quel que soit son statut aujourd''hui. Certifiée par la Direction des Crédits, revue le 15/01/2026.',

    -- RATIO : numerateur et denominateur dans la meme expression
    encours.taux_moyen_pondere
      NON ADDITIVE BY (date_arrete)
      AS SUM(IFF(statut_credit <> 'SOLDE', taux_nominal * capital_restant_du, 0))
         / NULLIF(SUM(IFF(statut_credit <> 'SOLDE', capital_restant_du, 0)), 0)
      WITH SYNONYMS ('taux moyen', 'taux', 'taux client moyen')
      COMMENT = 'Taux nominal moyen pondéré par le capital restant dû, même périmètre que l''encours. Jamais AVG(taux_nominal). Certifiée par la Direction Financière, revue le 15/01/2026.',

    -- RATIO derive : le denominateur EST la mesure encours_credit
    PRIVATE encours.encours_douteux
      NON ADDITIVE BY (date_arrete)
      AS SUM(IFF(statut_credit <> 'SOLDE' AND est_douteux, capital_restant_du, 0)),
    part_encours_douteux
      AS encours.encours_douteux / NULLIF(encours.encours_credit, 0)
      WITH SYNONYMS ('taux de douteux', 'part de douteux', 'créances douteuses')
      COMMENT = 'Part de l''encours de crédit portée par des crédits douteux. Le dénominateur est la mesure encours_credit : un seul encours dans le modèle. Certifiée par la Direction des Risques, revue le 15/01/2026.',

    -- COMPTAGE DISTINCT
    encours.nombre_credits
      NON ADDITIVE BY (date_arrete)
      AS COUNT(DISTINCT IFF(statut_credit <> 'SOLDE', credit_id, NULL))
      WITH SYNONYMS ('nombre de dossiers', 'nombre de prêts', 'crédits en cours')
      COMMENT = 'Crédits distincts non soldés à la date d''arrêté. Même périmètre que encours_credit. Certifiée par la Direction des Crédits, revue le 15/01/2026.',
    clients.nombre_clients_actifs
      AS COUNT(DISTINCT IFF(est_client_actif, client_id, NULL))
      WITH SYNONYMS ('clients actifs', 'base active', 'clients en portefeuille')
      COMMENT = 'Clients avec au moins un produit non clos ET une opération dans les 90 jours précédant le dernier arrêté. Présent seulement. Certifiée par la Direction Commerciale, revue le 15/01/2026.',

    -- FLUX : la table des operations a sa mesure
    operations.nombre_operations
      AS COUNT(operation_id)
      WITH SYNONYMS ('opérations', 'nombre de mouvements', 'transactions')
      COMMENT = 'Nombre d''opérations sur la période, lues à la date d''opération. Jamais SUM(montant) : la colonne est signée. Certifiée par la Direction des Opérations, revue le 15/01/2026.',

    -- RATIO, au grain client : portee par la table clients, et non par les
    -- faits. Un client compte une fois, quel que soit son nombre de credits.
    clients.age_moyen_emprunteurs
      AS SUM(IFF(est_emprunteur, age, NULL))
         / NULLIF(COUNT_IF(est_emprunteur AND age IS NOT NULL), 0)
      WITH SYNONYMS ('âge moyen', 'âge des emprunteurs')
      COMMENT = 'Âge moyen des clients portant au moins un crédit non soldé. Chaque client compte une fois. Les personnes morales, sans âge, sont exclues. Certifiée par la Direction Commerciale, revue le 15/01/2026.'
  )

  COMMENT = 'COMPTOIR : crédits, opérations et clients d''une banque de détail, au-dessus de SOCLE. Huit mesures certifiées.'

  AI_SQL_GENERATION
    'Sans date dans la question : dernier arrêté disponible pour l''encours, le taux, la part de douteux et le nombre de crédits ; l''indiquer dans la réponse. « Le mois dernier » désigne le mois du dernier arrêté. Pour les opérations, la date de référence est date_operation. « Agence » et « région » sans précision désignent l''agence qui porte le crédit ; l''indiquer dans la réponse. Montants en euros, arrondis à l''euro ; taux et parts en pourcentage à deux décimales.'

  AI_QUESTION_CATEGORIZATION
    'Refuser, en expliquant pourquoi, les questions sur : la satisfaction client, le NPS ou les réclamations (aucune source) ; le canal de souscription (non collecté, et l''agence n''en est pas un équivalent) ; le solde des comptes, moyen ou à une date (non historisé) ; le nombre de clients actifs ou d''emprunteurs à une date passée (la dimension client n''est pas historisée, le chiffre d''aujourd''hui n''en est pas un équivalent). Pour les clients partis ou ayant quitté la banque : répondre que la définition n''est pas validée par la Direction Commerciale. Refuser toute liste nominative de clients.'

  AI_VERIFIED_QUERIES (
    q1_encours_immo_region AS (
      QUESTION 'Quel est l''encours de crédit immobilier par région au dernier arrêté ?'
      ONBOARDING_QUESTION TRUE
      VERIFIED_BY '(Direction Financière = cdg-credits@exemple.fr)'
      SQL 'SELECT a.region, SUM(e.capital_restant_du) AS encours_credit FROM encours AS e JOIN agences AS a ON a.agence_id = e.agence_id JOIN produits AS p ON p.produit_code = e.produit_code WHERE p.sous_famille = ''Immobilier'' AND e.statut_credit <> ''SOLDE'' AND e.date_arrete = (SELECT MAX(date_arrete) FROM encours) GROUP BY a.region ORDER BY a.region'
    ),
    q4_taux_moyen_immo AS (
      QUESTION 'Quel est le taux moyen des crédits immobiliers ?'
      VERIFIED_BY '(Direction Financière = cdg-credits@exemple.fr)'
      SQL 'SELECT SUM(e.taux_nominal * e.capital_restant_du) / NULLIF(SUM(e.capital_restant_du), 0) AS taux_moyen_pondere FROM encours AS e JOIN produits AS p ON p.produit_code = e.produit_code WHERE p.sous_famille = ''Immobilier'' AND e.statut_credit <> ''SOLDE'' AND e.date_arrete = (SELECT MAX(date_arrete) FROM encours)'
    ),
    q8_age_moyen_emprunteurs AS (
      QUESTION 'Quel est l''âge moyen de nos clients emprunteurs ?'
      VERIFIED_BY '(Direction Commerciale = dir-commerciale@exemple.fr)'
      SQL 'SELECT SUM(c.age) / COUNT(DISTINCT c.client_id) AS age_moyen_emprunteurs FROM clients AS c WHERE c.est_emprunteur AND c.age IS NOT NULL'
    )
  );


-- =====================================================================
-- PARTIE 3 -- Les douze questions, rejouees
--
-- Pour chaque question : le SQL de reference sur les vues (le chiffre
-- qui fait foi), puis la meme question posee a COMPTOIR_SV. Les deux
-- doivent donner le meme resultat : c'est le test de non-regression.
-- Le dernier arrete charge est le 30/09/2026 ; « le mois dernier » est
-- donc septembre 2026, comme dans AI_SQL_GENERATION.
-- =====================================================================

-- Q1 ✅ Encours immobilier par region au dernier arrete
--    Attendu : Auvergne-Rhone-Alpes 544 016,67 / Ile-de-France 478 166,67.
SELECT a.region, SUM(e.capital_restant_du) AS encours_credit
FROM ENCOURS_CREDIT_MENSUEL e
JOIN DIM_AGENCE  a ON a.agence_id    = e.agence_id
JOIN DIM_PRODUIT p ON p.produit_code = e.produit_code
WHERE p.sous_famille = 'Immobilier'
  AND e.statut_credit <> 'SOLDE'
  AND e.date_arrete = (SELECT MAX(date_arrete) FROM ENCOURS_CREDIT_MENSUEL)
GROUP BY a.region ORDER BY a.region;

SELECT * FROM SEMANTIC_VIEW(COMPTOIR_SV
  DIMENSIONS agences.region
  METRICS encours.encours_credit
  WHERE produits.sous_famille = 'Immobilier');


-- Q2 ✅ Clients actifs (au present seulement)
--    Attendu : 8. TOP_ACT en donnait 9 : le client 9 (TOP_ACT = N) est
--    actif selon la definition, les clients 2 et 10 (TOP_ACT = O) non.
SELECT COUNT(*) AS nombre_clients_actifs FROM DIM_CLIENT WHERE est_client_actif;

SELECT * FROM SEMANTIC_VIEW(COMPTOIR_SV METRICS clients.nombre_clients_actifs);


-- Q3 ✅ Production de credits le mois dernier
--    Attendu : 228 000 (credits 8 et 9). Sommer montant_octroye sur
--    toutes les lignes de septembre ajouterait chaque credit vivant.
SELECT SUM(montant_octroye) AS production_credit
FROM ENCOURS_CREDIT_MENSUEL
WHERE date_arrete = LAST_DAY(date_deblocage)
  AND date_deblocage BETWEEN '2026-09-01'::DATE AND '2026-09-30'::DATE;

SELECT * FROM SEMANTIC_VIEW(COMPTOIR_SV
  METRICS encours.production_credit
  WHERE encours.date_deblocage BETWEEN '2026-09-01'::DATE AND '2026-09-30'::DATE);


-- Q4 ✅ Taux moyen des credits immobiliers (pondere, dernier arrete)
--    Attendu : 2,70 %. La moyenne simple des taux donnait 2,33 %.
SELECT SUM(e.taux_nominal * e.capital_restant_du)
       / NULLIF(SUM(e.capital_restant_du), 0) AS taux_moyen_pondere
FROM ENCOURS_CREDIT_MENSUEL e
JOIN DIM_PRODUIT p ON p.produit_code = e.produit_code
WHERE p.sous_famille = 'Immobilier'
  AND e.statut_credit <> 'SOLDE'
  AND e.date_arrete = (SELECT MAX(date_arrete) FROM ENCOURS_CREDIT_MENSUEL);

SELECT * FROM SEMANTIC_VIEW(COMPTOIR_SV
  METRICS encours.taux_moyen_pondere
  WHERE produits.sous_famille = 'Immobilier');


-- Q5 ✅ Operations par type le mois dernier (date d'operation)
--    Attendu : Carte 4, Prelevement 3, Virement 5.
SELECT type_operation, COUNT(operation_id) AS nombre_operations
FROM OPERATION_COMPTE
WHERE date_operation BETWEEN '2026-09-01'::DATE AND '2026-09-30'::DATE
GROUP BY type_operation ORDER BY type_operation;

SELECT * FROM SEMANTIC_VIEW(COMPTOIR_SV
  DIMENSIONS operations.type_operation
  METRICS operations.nombre_operations
  WHERE operations.date_operation BETWEEN '2026-09-01'::DATE AND '2026-09-30'::DATE);


-- Q6 ❌ Solde moyen des comptes courants : ABSENCE DECLAREE.
--    Aucune requete : le solde n'est pas historise, D_CPT ne sort pas
--    au comptoir. Le moteur doit refuser (AI_QUESTION_CATEGORIZATION).


-- Q7 ✅ Agence au plus fort encours (dernier arrete, agence porteuse)
--    Attendu : Paris Opera, 438 100.
SELECT a.agence, SUM(e.capital_restant_du) AS encours_credit
FROM ENCOURS_CREDIT_MENSUEL e
JOIN DIM_AGENCE a ON a.agence_id = e.agence_id
WHERE e.statut_credit <> 'SOLDE'
  AND e.date_arrete = (SELECT MAX(date_arrete) FROM ENCOURS_CREDIT_MENSUEL)
GROUP BY a.agence ORDER BY encours_credit DESC LIMIT 1;

SELECT * FROM SEMANTIC_VIEW(COMPTOIR_SV
  DIMENSIONS agences.agence
  METRICS encours.encours_credit)
ORDER BY encours_credit DESC LIMIT 1;


-- Q8 ✅ Age moyen des emprunteurs, un client une fois
--    Attendu : 41,6 ans (7 emprunteurs). Piege trouve en executant :
--    le client 6 est une SAS, sans date de naissance. Le compter au
--    denominateur donne 36,4 ans. Les personnes morales sont exclues,
--    et la mesure le dit.
SELECT SUM(age) / COUNT(DISTINCT client_id) AS age_moyen_emprunteurs
FROM DIM_CLIENT WHERE est_emprunteur AND age IS NOT NULL;

SELECT * FROM SEMANTIC_VIEW(COMPTOIR_SV METRICS clients.age_moyen_emprunteurs);


-- Q9 ✅ Part des douteux dans l'encours (dernier arrete)
--    Attendu : 2,40 %.
SELECT SUM(IFF(est_douteux, capital_restant_du, 0))
       / NULLIF(SUM(capital_restant_du), 0) AS part_encours_douteux
FROM ENCOURS_CREDIT_MENSUEL
WHERE statut_credit <> 'SOLDE'
  AND date_arrete = (SELECT MAX(date_arrete) FROM ENCOURS_CREDIT_MENSUEL);

SELECT * FROM SEMANTIC_VIEW(COMPTOIR_SV METRICS part_encours_douteux);


-- Q10 ⚠️ Clients partis ce trimestre : la DEFINITION manque.
--    La requete ci-dessous s'ecrit, et c'est le piege : elle repose sur
--    date_sortie_relation, dont la regle n'est ecrite nulle part. Elle
--    n'est PAS dans la vue semantique. A montrer, pas a certifier.
--    Resultat : 2 (clients 10 et 11), un chiffre que personne ne signe.
SELECT COUNT(*) AS sorties_non_certifiees
FROM DIM_CLIENT
WHERE date_sortie_relation BETWEEN '2026-07-01'::DATE AND '2026-09-30'::DATE;


-- Q11 ❌ Satisfaction par agence : ABSENCE DECLAREE. Aucune source.
-- Q12 ❌ Canal de souscription : ABSENCE DECLAREE. Non collecte, et
--        l'agence n'en est pas un equivalent.


-- =====================================================================
-- A verifier sur le compte avant le jour 4
--
--   [ ] COMMENT dans la liste de colonnes d'un CREATE VIEW.
--   [ ] DIM_AGENCE en deux tables logiques (agences, agences_rattachement)
--       et deux dimensions de meme nom court (agence, region) sur deux
--       tables logiques differentes.
--   [ ] NON ADDITIVE BY sur un ratio (taux_moyen_pondere) et sur un
--       COUNT(DISTINCT) : le dernier arrete est-il bien retenu ?
--   [ ] La metrique derivee part_encours_douteux sur une metrique PRIVATE.
--   [ ] age_moyen_emprunteurs interrogee avec une dimension des faits :
--       Snowflake doit le refuser (la metrique est au grain client).
--       Si c'est le cas, le piege de la question 8 est impossible par
--       construction : a montrer en salle.
--   [ ] Le SQL des AI_VERIFIED_QUERIES ecrit sur les tables logiques
--       (encours, agences...), comme dans l'exemple de la documentation.
--   [ ] Les reponses de Cortex Analyst aux questions 6, 11 et 12 :
--       refus, et non une approximation.
-- =====================================================================
