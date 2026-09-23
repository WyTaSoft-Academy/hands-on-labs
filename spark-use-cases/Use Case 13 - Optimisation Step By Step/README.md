# Use Case 13 — Optimisation Step By Step (PySpark / Databricks)

> 🇫🇷 Version française : [`README.fr.md`](./README.fr.md)

A set of hands-on Spark optimization exercises. Each sub-use-case ships **working but
deliberately non-optimized** code (`pyspark/w00X.py`). The trainee's job is to optimize it while
keeping the output identical.

Each folder follows the same pattern:

| File                          | Role                                                        |
|-------------------------------|-------------------------------------------------------------|
| `pyspark/w00X.py`             | **Starter** — the non-optimized code given to trainees      |
| `pyspark/w00X_solution.py`    | **Instructor solution** — one reasonable optimized version  |
| `scala/w00X.scala`            | Scala version of the starter (where present)                |
| `README.md` / `README.fr.md`  | Problem statement, things to investigate, hints, deliverable|
| `data*/`                      | Sample dataset                                              |

## The use cases

| #    | Topic                                   | Folder    |
|------|-----------------------------------------|-----------|
| UC1  | Reading & basic aggregation             | `uc - 1/` |
| UC2  | Repeated computation & an expensive join| `uc - 2/` |
| UC3  | Reading & caching a reused DataFrame    | `uc - 3/` |
| UC4  | Skewed join & broadcast                 | `uc - 4/` |

## How to run the exercise

1. Trainees run `pyspark/w00X.py` as-is and inspect the **Spark UI** (Jobs / Stages / SQL /
   Storage) to see what is slow.
2. They iterate, comparing wall-clock time, number of jobs/stages, bytes read, shuffle volume,
   and per-task skew before and after.
3. Debrief with `pyspark/w00X_solution.py`.
