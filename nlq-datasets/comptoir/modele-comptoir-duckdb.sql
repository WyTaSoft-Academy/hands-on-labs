-- =====================================================================
-- COMPTOIR dans DuckDB : le corrige du TP 2, executable.
--
-- Version FORMATEUR. A ne consulter qu'APRES la restitution du TP 2,
-- comme modele-comptoir.sql et mesures-comptoir.yaml. Les memes vues et
-- les memes requetes que modele-comptoir-snowflake.sql, sur les memes
-- donnees : SOCLE rempli (socle/socle-donnees-duckdb.sql).
--
--   duckdb -c ".read comptoir/modele-comptoir-duckdb.sql"   (depuis tp/)
--   duckdb -ui comptoir.duckdb   puis   .read ...            (interface)
--
-- Deux parties :
--   1. Les six vues COMPTOIR, au-dessus de SOCLE : noms lisibles, grain
--      ecrit, codes devenus libelles. SOCLE n'est pas touche.
--   2. Les douze questions, rejouees avec les mesures certifiees de
--      mesures-comptoir.yaml, et leur resultat attendu.
--
-- DuckDB n'a pas de couche semantique : les mesures certifiees sont ici
-- appliquees a la main, requete par requete. C'est exactement ce que la
-- vue semantique de Snowflake fait a votre place (voir la partie 2 de
-- modele-comptoir-snowflake.sql), et ce que le moteur NLQ ne sait pas
-- faire seul.
-- =====================================================================

.read socle/socle-donnees-duckdb.sql


-- =====================================================================
-- PARTIE 1 -- Les six vues COMPTOIR
-- =====================================================================

-- ---------------------------------------------------------------------
-- GRAIN : une ligne = UN CREDIT x UN MOIS D'ARRETE.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW ENCOURS_CREDIT_MENSUEL (
  credit_id,
  client_id,
  agence_id,                -- Agence qui PORTE le credit. Ce n'est pas l'agence de rattachement du client.
  produit_code,
  date_arrete,              -- Dernier jour du mois. LA date de reference de la table.
  date_deblocage,           -- Date de deblocage du credit. Date de reference de la production, pas de l'encours.
  capital_restant_du,       -- STOCK, en euros : se somme entre credits, jamais entre mois.
  montant_echeance,         -- FLUX, en euros : echeance du mois, additive partout.
  montant_octroye,          -- Constant sur toutes les lignes d'un meme credit. Ne jamais le sommer ici : utiliser la mesure production_credit.
  taux_nominal,             -- RATIO : jamais somme, jamais moyenne simple. Utiliser taux_moyen_pondere.
  statut_credit,            -- ACTIF, SOLDE ou CONTENTIEUX, a la date d'arrete.
  est_douteux               -- Vrai si le credit est classe douteux a la date d'arrete.
)
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
COMMENT ON VIEW ENCOURS_CREDIT_MENSUEL IS
  'Photographie mensuelle des credits. Une ligne = un credit x un mois d''arrete. capital_restant_du est un stock : il se somme entre credits, jamais entre mois.';
-- Retires : DT_INS (technique), et le code CD_STA, devenu un libelle.


-- ---------------------------------------------------------------------
-- GRAIN : une ligne = UNE OPERATION.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW OPERATION_COMPTE (
  operation_id,
  compte_id,                -- Identifiant du compte, garde pour compter des comptes distincts. D_CPT n'est pas exposee : son seul attribut propre est un solde sans date.
  client_id,                -- Client titulaire du compte, denormalise pour eviter une jointure.
  date_operation,           -- LA date de reference de la table.
  date_comptabilisation,    -- Date comptable. A n'utiliser que si la question la demande explicitement.
  montant,                  -- Signe : negatif au debit, positif au credit. Ne jamais le sommer sans filtre sur le sens.
  sens,                     -- DEBIT ou CREDIT.
  type_operation,           -- Ce qui a ete fait : Virement, Prelevement, Carte, Cheque.
  type_compte               -- Sur quel compte : Compte courant, Livret A, PEL, Compte a terme. Ne pas confondre avec type_operation.
)
AS
SELECT
  o.ID_OPE,
  o.ID_CPT,
  k.ID_CLI,
  o.DT_OPE,
  o.DT_CPT,
  IF(o.SNS = 'D', -o.MT_OPE, o.MT_OPE),
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
COMMENT ON VIEW OPERATION_COMPTE IS
  'Une ligne = une operation. Date de reference : date_operation. date_comptabilisation doit etre demandee explicitement.';


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
  segment,                  -- Particulier, Professionnel ou Entreprise.
  date_entree_relation,
  date_sortie_relation,     -- Renseignee par une regle qui n'est ecrite nulle part : ne pas l'utiliser pour compter les departs (question 10).
  agence_rattachement_id,   -- Agence de RATTACHEMENT du client. Ce n'est PAS l'agence qui porte ses credits.
  age,                      -- Age en annees au dernier arrete charge.
  est_client_actif,         -- Au moins un produit non clos ET au moins une operation dans les 90 jours precedant le dernier arrete charge. Definition validee par la Direction Commerciale le 15/01/2026. Etat courant, non historise.
  est_emprunteur            -- Au moins un credit non solde au dernier arrete charge. Etat courant, non historise.
)
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
  JOIN dernier ON o.DT_OPE >  dernier.d - INTERVAL 90 DAY
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
  FLOOR(date_diff('month', c.DT_NAI, dernier.d) / 12),
  (cv.ID_CLI IS NOT NULL OR co.ID_CLI IS NOT NULL) AND o9.ID_CLI IS NOT NULL,
  cv.ID_CLI IS NOT NULL
FROM D_CLI c
CROSS JOIN dernier
LEFT JOIN credits_vivants cv ON cv.ID_CLI = c.ID_CLI
LEFT JOIN comptes_ouverts co ON co.ID_CLI = c.ID_CLI
LEFT JOIN operations_90j  o9 ON o9.ID_CLI = c.ID_CLI;
COMMENT ON VIEW DIM_CLIENT IS
  'Une ligne = un client, dans son etat courant. Dimension NON historisee : une question sur une date passee (« combien de clients actifs en mars ? ») n''a pas de reponse ici et doit etre refusee.';
-- Decision a faire valider : modele-comptoir.sql liste « Patrimonial »
-- pour le troisieme segment, mais le seul client PE est une SAS. Le
-- libelle d'un code se demande au metier, il ne se devine pas.


-- ---------------------------------------------------------------------
-- La hierarchie produit, denormalisee, avec des libelles.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW DIM_PRODUIT (
  produit_code,
  produit,
  sous_famille,             -- Immobilier, Consommation ou Trésorerie.
  famille,
  segment_produit,
  est_reglemente            -- Vrai pour les prets reglementes (pret a taux zero).
)
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
COMMENT ON VIEW DIM_PRODUIT IS
  'Une ligne = un produit. Hierarchie a plat : produit, sous-famille, famille.';


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
COMMENT ON VIEW DIM_AGENCE IS
  'Une ligne = une agence. Sert deux fois dans la vue semantique : agence qui porte le credit, et agence de rattachement du client.';


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
  est_dernier_arrete        -- Vrai pour le dernier arrete charge : repond a « au dernier arrete ».
)
AS
WITH jours AS (
  SELECT CAST(DATE '2019-01-01' + CAST(range AS INTEGER) AS DATE) AS d
  FROM range(2922)
)
SELECT
  d,
  YEAR(d) || '-' || LPAD(CAST(MONTH(d) AS VARCHAR), 2, '0'),
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
COMMENT ON VIEW DIM_DATE IS
  'Une ligne = un jour calendaire, du 1er janvier 2019 au 31 decembre 2026.';


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
-- PARTIE 2 -- Les douze questions, rejouees
--
-- Pour chaque question : le SQL de reference sur les vues, avec la
-- mesure certifiee appliquee. C'est le chiffre qui fait foi : celui que
-- la vue semantique et le moteur NLQ doivent retrouver.
-- Le dernier arrete charge est le 30/09/2026 ; « le mois dernier » est
-- donc septembre 2026.
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


-- Q2 ✅ Clients actifs (au present seulement)
--    Attendu : 8. TOP_ACT en donnait 9 : le client 9 (TOP_ACT = N) est
--    actif selon la definition, les clients 2 et 10 (TOP_ACT = O) non.
SELECT COUNT(*) AS nombre_clients_actifs FROM DIM_CLIENT WHERE est_client_actif;


-- Q3 ✅ Production de credits le mois dernier
--    Attendu : 228 000 (credits 8 et 9). Sommer montant_octroye sur
--    toutes les lignes de septembre ajouterait chaque credit vivant.
SELECT SUM(montant_octroye) AS production_credit
FROM ENCOURS_CREDIT_MENSUEL
WHERE date_arrete = LAST_DAY(date_deblocage)
  AND date_deblocage BETWEEN DATE '2026-09-01' AND DATE '2026-09-30';


-- Q4 ✅ Taux moyen des credits immobiliers (pondere, dernier arrete)
--    Attendu : 2,70 %. La moyenne simple des taux donnait 2,33 %.
SELECT SUM(e.taux_nominal * e.capital_restant_du)
       / NULLIF(SUM(e.capital_restant_du), 0) AS taux_moyen_pondere
FROM ENCOURS_CREDIT_MENSUEL e
JOIN DIM_PRODUIT p ON p.produit_code = e.produit_code
WHERE p.sous_famille = 'Immobilier'
  AND e.statut_credit <> 'SOLDE'
  AND e.date_arrete = (SELECT MAX(date_arrete) FROM ENCOURS_CREDIT_MENSUEL);


-- Q5 ✅ Operations par type le mois dernier (date d'operation)
--    Attendu : Carte 4, Prelevement 3, Virement 5.
SELECT type_operation, COUNT(operation_id) AS nombre_operations
FROM OPERATION_COMPTE
WHERE date_operation BETWEEN DATE '2026-09-01' AND DATE '2026-09-30'
GROUP BY type_operation ORDER BY type_operation;


-- Q6 ❌ Solde moyen des comptes courants : ABSENCE DECLAREE.
--    Aucune requete : le solde n'est pas historise, D_CPT ne sort pas
--    au comptoir. Le moteur doit refuser (absences_declarees).


-- Q7 ✅ Agence au plus fort encours (dernier arrete, agence porteuse)
--    Attendu : Paris Opera, 438 100.
SELECT a.agence, SUM(e.capital_restant_du) AS encours_credit
FROM ENCOURS_CREDIT_MENSUEL e
JOIN DIM_AGENCE a ON a.agence_id = e.agence_id
WHERE e.statut_credit <> 'SOLDE'
  AND e.date_arrete = (SELECT MAX(date_arrete) FROM ENCOURS_CREDIT_MENSUEL)
GROUP BY a.agence ORDER BY encours_credit DESC LIMIT 1;


-- Q8 ✅ Age moyen des emprunteurs, un client une fois
--    Attendu : 41,6 ans (7 emprunteurs). Piege trouve en executant :
--    le client 6 est une SAS, sans date de naissance. Le compter au
--    denominateur donne 36,4 ans. Les personnes morales sont exclues,
--    et la mesure le dit.
SELECT SUM(age) / COUNT(DISTINCT client_id) AS age_moyen_emprunteurs
FROM DIM_CLIENT WHERE est_emprunteur AND age IS NOT NULL;


-- Q9 ✅ Part des douteux dans l'encours (dernier arrete)
--    Attendu : 2,40 %.
SELECT SUM(IF(est_douteux, capital_restant_du, 0))
       / NULLIF(SUM(capital_restant_du), 0) AS part_encours_douteux
FROM ENCOURS_CREDIT_MENSUEL
WHERE statut_credit <> 'SOLDE'
  AND date_arrete = (SELECT MAX(date_arrete) FROM ENCOURS_CREDIT_MENSUEL);


-- Q10 ⚠️ Clients partis ce trimestre : la DEFINITION manque.
--    La requete ci-dessous s'ecrit, et c'est le piege : elle repose sur
--    date_sortie_relation, dont la regle n'est ecrite nulle part. Elle
--    n'est PAS une mesure certifiee. A montrer, pas a certifier.
--    Resultat : 2 (clients 10 et 11), un chiffre que personne ne signe.
SELECT COUNT(*) AS sorties_non_certifiees
FROM DIM_CLIENT
WHERE date_sortie_relation BETWEEN DATE '2026-07-01' AND DATE '2026-09-30';


-- Q11 ❌ Satisfaction par agence : ABSENCE DECLAREE. Aucune source.
-- Q12 ❌ Canal de souscription : ABSENCE DECLAREE. Non collecte, et
--        l'agence n'en est pas un equivalent.
