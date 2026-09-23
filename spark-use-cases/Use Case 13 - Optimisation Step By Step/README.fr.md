# Use Case 13 — Optimisation pas à pas (PySpark / Databricks)

> 🇬🇧 English version: [`README.md`](./README.md)

Une série d'exercices pratiques d'optimisation Spark. Chaque sous-cas fournit du code
**fonctionnel mais volontairement non optimisé** (`pyspark/w00X.py`). La mission du participant :
l'optimiser tout en conservant un résultat identique.

Chaque dossier suit le même schéma :

| Fichier                       | Rôle                                                            |
|-------------------------------|----------------------------------------------------------------|
| `pyspark/w00X.py`             | **Code de départ** — version non optimisée remise aux participants |
| `pyspark/w00X_solution.py`    | **Solution formateur** — une version optimisée raisonnable      |
| `scala/w00X.scala`            | Version Scala du code de départ (quand elle existe)             |
| `README.md` / `README.fr.md`  | Énoncé, pistes à explorer, indices, livrable                   |
| `data*/`                      | Jeu de données d'exemple                                        |

## Les cas d'usage

| #    | Thème                                       | Dossier   |
|------|---------------------------------------------|-----------|
| UC1  | Lecture & agrégation simple                 | `uc - 1/` |
| UC2  | Calcul répété & une jointure coûteuse       | `uc - 2/` |
| UC3  | Lecture & mise en cache d'un DataFrame réutilisé | `uc - 3/` |
| UC4  | Jointure déséquilibrée (skew) & broadcast   | `uc - 4/` |

## Déroulé de l'exercice

1. Les participants exécutent `pyspark/w00X.py` tel quel et inspectent la **Spark UI**
   (Jobs / Stages / SQL / Storage) pour repérer ce qui est lent.
2. Ils itèrent en comparant le temps d'exécution, le nombre de jobs/stages, les octets lus, le
   volume de shuffle et le skew par tâche, avant et après.
3. Débrief avec `pyspark/w00X_solution.py`.
