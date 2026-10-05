# NLQ & Datasets — travaux pratiques

Un exercice et trois TP sur un **même jeu de données fictif** : une banque de détail ordinaire.
L'exercice lit le SQL qu'un moteur a généré dessus, le TP 1 le diagnostique, le TP 1 bis
chiffre ce diagnostic, le TP 2 le reformule pour qu'un moteur de requêtage en
langage naturel (NLQ) puisse l'interroger sans deviner. Tout le fil pratique consiste
à passer du modèle `SOCLE` au modèle `COMPTOIR`.

## Les fichiers

| Fichier | TP | Contenu |
|---|---|---|
| [`exercice-sql-enonce.md`](exercice-sql-enonce.md) | Exercice | Quatre questions et le SQL qu'un moteur a généré : retrouver les décisions prises en silence |
| [`tp1-enonce.md`](tp1-enonce.md) | TP 1 | Les douze questions du métier, la grille de diagnostic |
| [`socle/modele-socle-participant.sql`](socle/modele-socle-participant.sql) | TP 1 | Le modèle existant : six tables, telles qu'elles sont, sans documentation |
| [`tp1bis-enonce.md`](tp1bis-enonce.md) | TP 1 bis | Prouver le diagnostic : deux lectures défendables par défaut, et l'écart chiffré qu'elles produisent |
| [`socle/socle-donnees-duckdb.sql`](socle/socle-donnees-duckdb.sql) | TP 1 bis | Le même modèle rempli des données d'une petite banque fictive, pour DuckDB |
| [`tp2-enonce.md`](tp2-enonce.md) | TP 2 | Les quatre étapes de la reformulation, et le gabarit de mesure |
| [`comptoir/comptoir-participant.sql`](comptoir/comptoir-participant.sql) | TP 2 | Squelette des étapes 1 et 2 : tables, colonnes, grain. Ce qui reste à faire est marqué `<< ainsi >>` |
| [`comptoir/mesures-participant.yaml`](comptoir/mesures-participant.yaml) | TP 2 | Squelette des étapes 3 et 4 : mesures, absences, questions à rejouer |

On travaille en binôme, de préférence un profil technique avec un profil métier.

## Presque rien à installer

Les fichiers `.sql` sont du DDL **à lire**, pas à exécuter : les TP sont des exercices
de conception. Aucune base, aucun outil, aucune installation : un éditeur de texte suffit.

Seule exception : le **TP 1 bis** se joue sur `SOCLE` rempli, avec
[DuckDB](https://duckdb.org/docs/installation/) :

```
duckdb socle.duckdb -c ".read socle/socle-donnees-duckdb.sql"
duckdb -ui socle.duckdb
```

Sans installation possible, [shell.duckdb.org](https://shell.duckdb.org) fonctionne dans le
navigateur : y coller le contenu du fichier.

Le jeu de données est fictif. Aucune donnée réelle.

Les corrigés ne sont pas publiés : ils sont présentés en restitution.
