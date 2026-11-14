# TP 6 : le dashboard du réseau

**Module 8 · ≈ 1 h 45, pause comprise · individuel, puis en binôme · restitution 10 min**

La direction du réseau de la Banque Lumen veut suivre ses agences sans écrire de SQL. Vous lui
préparez, sur votre gold et votre silver : des requêtes enregistrées, une alerte, un dashboard
publié, et une connexion Power BI.

Tout se fait dans **Databricks SQL**, sur le SQL warehouse `wh-dki-formation`. Point de départ : vos
tables à la fin du TP 5 (silver à 3 265 lignes, gold à 167 lignes). Remplacez `stagiaire01` par
votre compte, `stagiaire02` par votre binôme.

Rangez tout ce que vous créez dans un dossier `tp6` de votre espace personnel.

---

## Étape 1 · Opérations par région (≈ 10 min)

1. Dans le SQL editor, une requête qui donne, par **région**, le total des opérations et du
   montant net en euros, de la plus active à la moins active : `gold.flux_mensuels` joint à
   `bronze.agences`. Noms complets à trois niveaux.
2. Enregistrez-la : `lumen - opérations par région`.
3. Une **visualisation** en barres horizontales : région, opérations.
4. Un **filtre d'affichage** sur le tableau de résultats : seulement les régions de plus de
   400 opérations. A-t-il relancé la requête ?
5. **Exportez** le résultat en CSV.

## Étape 2 · Top agences du mois (≈ 10 min)

1. Une requête `lumen - top agences du mois` : les 3 agences au **montant net** le plus élevé pour
   un mois donné, avec leur nom, leurs opérations et leur montant net.
2. Le mois est un **paramètre** `:mois`, de type *Date*. Les mois de la gold sont le 1<sup>er</sup>
   du mois.
3. Exécutez pour juin (`2026-06-01`), puis pour juillet. Le classement change-t-il ? Pourquoi
   juillet est-il si différent ?

## Étape 3 · Une alerte (≈ 10 min)

1. Une requête `lumen - annulations` : le nombre d'opérations `ANNULEE` dans votre
   `silver.transactions`, dans une colonne `annulations`.
2. Une **alerte** : *Alerts* → *Create alert*, et collez-y le SQL de `lumen - annulations` (dans
   la nouvelle version des alertes, le SQL s'écrit dans l'alerte ; dans l'ancienne, *legacy*, on
   choisit la requête enregistrée). Déclenchée si `annulations` est **supérieur à 10**,
   notification par e-mail à vous-même, évaluation toutes les heures.
3. Évaluez-la tout de suite (ou attendez sa première évaluation). Dans quel état est-elle ?
   Avez-vous reçu l'e-mail ?
4. **Mettez-la en pause.**

## Étape 4 · Une planification (≈ 5 min)

Planifiez `lumen - opérations par région` tous les jours à 7h00, fuseau *Europe/Paris*. Où
retrouvez-vous cette planification, en dehors de la requête (regardez dans *Jobs & Pipelines*) ?
Puis **mettez-la en pause**.

## Étape 5 · Le dashboard (≈ 20 min)

*Dashboards* → *Create dashboard*, nommé `Banque Lumen - stagiaire01`.

1. Onglet *Data* : deux datasets.
   - `flux` : `gold.flux_mensuels` joint à `bronze.agences` (avec `region` et `nom`) ;
   - `annulations` : collez le SQL de l'étape 3 (un dataset est une table ou du SQL, pas une
     requête enregistrée).
2. Onglet *Canvas* :
   - trois **compteurs** : les opérations de la gold, celles de juillet, les annulations ;
   - des **barres** : les opérations par région ;
   - une **courbe** : les opérations par mois ;
   - un **filtre** sur le champ `region` du dataset `flux`.
3. Essayez le filtre sur *Bretagne*. Quels widgets changent, compteurs compris ? Lesquels ne
   changent pas, et pourquoi ?
4. **Publiez**, avec l'option *embed credentials* (vos identifiants intégrés).

## Étape 6 · Partager, en binôme (≈ 10 min)

1. Partagez la requête `lumen - opérations par région` avec votre binôme en `CAN RUN`. Il
   l'**exécute**. Que se passe-t-il, et pourquoi ?
2. Partagez le dashboard publié avec votre binôme. Il l'ouvre. Que voit-il, et pourquoi ?
3. Que faudrait-il faire pour que la requête marche chez lui ? Ne le faites pas : c'est une
   décision de gouvernance, pas de confort.

## Étape 7 · Power BI (≈ 15 min, sur Windows)

Si votre poste a **Power BI Desktop** (sinon, en binôme sur un poste qui l'a) :

1. Sur `wh-dki-formation` → *Connection details* : relevez *Server hostname* et *HTTP path*.
2. Power BI Desktop → *Get data* → *Azure Databricks*. Les deux valeurs, mode **Import**,
   authentification *Microsoft Entra ID* avec votre compte de formation.
3. Dans le navigateur : `lumen_stagiaire01` → `gold` → `flux_mensuels`, et `bronze` → `agences`.
   Chargez les deux.
4. Une relation sur `agence_id`, puis un graphique : les opérations par région. Les chiffres
   sont-ils ceux de l'étape 1 ?
5. Combien de lignes Power BI a-t-il chargées pour `flux_mensuels` ?

## Bonus

1. **Un abonnement.** Sur le dashboard publié : *Schedule*, chaque lundi à 8h00, abonnez-vous.
   Puis supprimez la planification.
2. **Genie**, si le formateur a préparé un *Genie space* : demandez « combien d'opérations en
   juillet, par région ? ». Lisez le SQL qu'il a écrit. Est-il juste ?

---

## Ce qu'on attend en fin de TP

| Mesure | Votre résultat |
|---|---|
| Opérations en Île-de-France / en Bretagne | |
| Top 3 de juin, au montant net | |
| Opérations de la gold / dont juillet | |
| Annulations, et l'état de l'alerte | |
| Ce que voit votre binôme : la requête / le dashboard | |
| Lignes chargées dans Power BI | |

En partant : alerte et planifications **en pause**, cluster arrêté.
