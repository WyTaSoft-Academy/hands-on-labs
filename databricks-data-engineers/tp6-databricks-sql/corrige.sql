-- TP 6 : corrigé. Databricks SQL, SQL warehouse wh-dki-formation.
-- Remplacer stagiaire01. Les résultats attendus viennent du fichier des résultats attendus (sections
-- tp6 et tp5.gold), recalculés avec pandas ; ce SQL n'a pas été exécuté sur un workspace.

-- =========================================================================
-- Étape 1 : lumen - opérations par région
-- =========================================================================
SELECT a.region,
       SUM(f.operations)      AS operations,
       SUM(f.montant_net_eur) AS montant_net_eur
FROM lumen_stagiaire01.gold.flux_mensuels AS f
JOIN lumen_stagiaire01.bronze.agences    AS a USING (agence_id)
GROUP BY a.region
ORDER BY operations DESC;
-- Île-de-France 591, Auvergne-Rhône-Alpes 568, Pays de la Loire 454, Occitanie 335,
-- Grand Est 292, Hauts-de-France 279, Nouvelle-Aquitaine 265, Provence-Alpes-Côte d'Azur 227,
-- Bretagne 143. Total 3154.
-- 4. Le filtre d'affichage (> 400) garde 3 régions, sans relancer la requête : il filtre les
--    9 lignes déjà reçues.

-- =========================================================================
-- Étape 2 : lumen - top agences du mois
-- =========================================================================
SELECT a.nom, f.operations, f.montant_net_eur
FROM lumen_stagiaire01.gold.flux_mensuels AS f
JOIN lumen_stagiaire01.bronze.agences    AS a USING (agence_id)
WHERE f.mois = :mois
ORDER BY f.montant_net_eur DESC
LIMIT 3;
-- :mois = 2026-06-01 : Lumen Limoges ≈ 33240, Lumen Clermont-Ferrand ≈ 26148, Lumen Paris Bastille ≈ 25676.
-- :mois = 2026-07-01 : un autre classement, et des montants bien plus faibles. Juillet ne contient
-- que trois jours d'arrivées, et seulement des achats par carte : des débits, donc des montants
-- nets négatifs. Le « plus élevé » est le moins négatif.

-- =========================================================================
-- Étape 3 : lumen - annulations, et l'alerte
-- =========================================================================
SELECT COUNT_IF(statut = 'ANNULEE') AS annulations   -- 12 : 4 par jour, du 1er au 3 juillet
FROM lumen_stagiaire01.silver.transactions;
-- Les 12 annulations sont reçues du 1er au 3 juillet ; elles annulent des opérations de juin.
-- Alerte : ce SQL collé dans l'alerte (nouvelle version ; dans l'ancienne, legacy, on choisit la
-- requête enregistrée). annulations > 10 → état TRIGGERED (12 > 10), un e-mail. Mise en pause ensuite.

-- =========================================================================
-- Étape 4 : la planification
-- =========================================================================
-- À vérifier sur le workspace : la planification d'une requête est exécutée comme un job, qu'on
-- retrouve dans Jobs & Pipelines. Si elle n'y apparaît pas (selon la version de l'éditeur), la
-- réponse est : seulement sur la requête elle-même (*Schedule*), et ses exécutions dans Query
-- history. Dans les deux cas, chaque exécution réveille wh-dki-formation. Mise en pause ensuite.

-- =========================================================================
-- Étape 5 : le dashboard « Banque Lumen - stagiaire01 »
-- =========================================================================
-- Dataset flux :
SELECT f.agence_id, a.nom, a.region, f.mois, f.operations, f.montant_net_eur
FROM lumen_stagiaire01.gold.flux_mensuels AS f
JOIN lumen_stagiaire01.bronze.agences    AS a USING (agence_id);
-- Dataset annulations : le SQL de l'étape 3, collé (un dataset est une table ou du SQL).
--
-- Widgets :
--  * Compteur « Opérations (gold) » : SUM(operations) sur flux         → 3154
--    Ce sont les opérations validées des clients connus. La silver compte 3253 VALIDEE
--    (3265 - 12) : l'écart vient des comptes sans client, écartés par la jointure de la gold.
--  * Compteur « Juillet » : SUM(operations) sur flux, filtre mois = 2026-07-01 → 62
--    (dans le widget, ou par un champ calculé SUM(IF(mois = DATE'2026-07-01', operations, 0)))
--  * Compteur « Annulations » : annulations sur annulations             → 12
--  * Barres : region / SUM(operations)
--  * Courbe : mois / SUM(operations) : 529, 521, 521, 506, 505, 510, 62
--  * Filtre : lié au champ region du dataset flux
-- 3. Un filtre se lie à un champ d'un dataset : il filtre tous les widgets de la page construits sur
--    ce dataset. Avec Bretagne, les widgets de flux suivent, compteurs compris (143 opérations ;
--    juillet : celles de la Bretagne). Le compteur des annulations, sur un autre dataset sans
--    region, ne change pas. (Comportement exact à vérifier la veille sur le workspace.)
-- 4. Publication avec embed credentials.

-- =========================================================================
-- Étape 6 : partager, en binôme
-- =========================================================================
-- 1. La requête partagée s'exécute avec les privileges du binôme : PERMISSION_DENIED. Au TP 3,
--    il n'a reçu que USE CATALOG, USE SCHEMA sur gold et SELECT sur gold.v_clients : rien sur
--    gold.flux_mensuels ni sur le schema bronze.
-- 2. Le dashboard publié avec embed credentials interroge les tables avec vos privileges : il voit
--    tous vos chiffres.
-- 3. Lui donner SELECT sur gold.flux_mensuels, et USE SCHEMA + SELECT sur bronze.agences (ou mieux,
--    une table gold qui contient déjà la région). Une décision de gouvernance.

-- =========================================================================
-- Étape 7 : Power BI
-- =========================================================================
-- Server hostname : adb-<id>.<n>.azuredatabricks.net ; HTTP path : /sql/1.0/warehouses/<id>.
-- Import de flux_mensuels : 167 lignes (AG15 n'a pas de ligne en juillet) ; agences : 24 lignes. Relation agence_id (plusieurs → un).
-- Les opérations par région sont celles de l'étape 1 : mêmes tables, même calcul.
