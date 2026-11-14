# Databricks pour data engineers : travaux pratiques

Les énoncés et les données des travaux pratiques de la formation **Databricks pour data
engineers** (3 jours, Azure Databricks). Les corrigés ne sont pas publiés : ils sont présentés en
restitution, à la fin de chaque TP.

## Le jeu de données : Banque Lumen

Une banque de détail **fictive** : 50 clients, 24 agences, six mois d'opérations (janvier à juin
2026) et trois arrivées quotidiennes en juillet. Le jeu est **petit exprès** (≈ 3 200 opérations,
≈ 130 Ko) : chaque requête répond en quelques secondes, et les défauts se comptent à l'œil. Aucun
nom, aucune adresse, aucun identifiant n'est réel ; les numéros de compte (`CPT0001234`) ne sont
pas des IBAN.

| Fichier | Contenu |
|---|---|
| `donnees/banque/clients.csv` | Les 50 clients (CSV à la française, avec des défauts à trouver) |
| `donnees/banque/comptes.csv` | Les comptes |
| `donnees/banque/transactions/2026-01.parquet` … `2026-06.parquet` | Les opérations, un fichier par mois |
| `donnees/banque/arrivees/transactions_2026-07-0{1,2,3}.csv` | Les arrivées quotidiennes du TP 5 |
| `donnees/agences.sql` | La table des 24 agences, chargée dans Azure SQL (TP 3) |
| `donnees/secours/taux_eur_2026S1.json` | La réponse de l'API des taux de change, si l'API est bloquée (TP 4) |

Pendant la formation, ces fichiers sont déjà déposés dans ADLS : vous n'avez rien à télécharger.

## Les TP

| TP | Module | Sujet |
|---|---|---|
| [TP 0](tp0-premier-contact/enonce.md) | 1 | Premier contact : la barre latérale, le catalog `samples`, trois requêtes, un refus |
| [TP 1](tp1-workspace-sources/enonce.md) | 2 | Workspace et sources externes : lister et lire les fichiers bruts dans ADLS |
| [TP 2](tp2-clusters/enonce.md) | 3 | Clusters : un cluster single-node sous cluster policy |
| [TP 3](tp3-unity-catalog/enonce.md) | 4 | Unity Catalog : un catalog à soi, les tables bronze, une view partagée, la base Azure SQL |
| [TP 4](tp4-notebooks/enonce.md) | 5 | Notebooks : silver, gold, l'appel d'une API |
| [Pratique guidée](pratique-module6/enonce.md) | 6 | Spark et Delta : historique, time travel, `MERGE` |
| [TP 5](tp5-orchestration/enonce.md) | 7 | Orchestration : un job à deux tasks qui absorbe les arrivées quotidiennes |
| [TP 6](tp6-databricks-sql/enonce.md) | 8 | Databricks SQL : requêtes, alerte, dashboard, Power BI |

Chaque TP part du résultat du précédent.

## L'aide-mémoire

[`aide-memoire-pyspark-sql.md`](aide-memoire-pyspark-sql.md) : lire, transformer, agréger, joindre et
écrire, en PySpark et en SQL côte à côte, plus les commandes Delta utiles. À garder ouvert pendant
les TP.

## Les valeurs à remplacer

Les énoncés citent des valeurs à remplacer par les vôtres, données par le formateur dans le chat :

| Dans l'énoncé | Par |
|---|---|
| `stagiaire01` | votre compte |
| `stagiaire02` | le compte de votre binôme |
| `<stockage>` | le nom du storage account |
| `<domaine>` | le domaine des comptes de formation |

Les identifiants de connexion ne sont jamais publiés ici : chacun reçoit les siens en privé.
