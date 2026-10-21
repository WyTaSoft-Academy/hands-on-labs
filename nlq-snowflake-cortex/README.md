# NLQ, Partie 2 — Snowflake CoWork & Cortex Analyst

La suite pratique de [`../nlq-datasets/`](../nlq-datasets/README.md) : le même jeu de données
fictif, une banque de détail ordinaire, cette fois interrogé en langage naturel dans Snowflake.
Le jour 3 explore le modèle avec **Snowflake CoWork** (anciennement Snowflake Intelligence,
le nom retenu par le programme), le jour 4 le prépare et le teste
pour **Cortex Analyst**, en comparant le SQL généré à un SQL de référence.

## Les fichiers

| Fichier | Contenu |
|---|---|
| [`programme.md`](programme.md) | Le programme des deux jours |
| [`socle/socle-donnees-snowflake.sql`](socle/socle-donnees-snowflake.sql) | Le modèle `SOCLE` rempli des données de la banque fictive, en SQL Snowflake |

Le modèle `COMPTOIR` et ses huit mesures, construits pendant la Partie 1, sont dans
[`../nlq-datasets/comptoir/`](../nlq-datasets/comptoir/).

## Ce qu'il faut

Un compte Snowflake où **Snowflake CoWork et Cortex Analyst** sont activés, et un schéma
où vous pouvez créer des tables, un par binôme.

Ouvrir `socle/socle-donnees-snowflake.sql` dans une worksheet Snowsight, choisir ce schéma, et
tout exécuter. Les énoncés des deux travaux pratiques sont présentés en séance.

## Le jeu de données

Fictif, et volontairement **ordinaire**. Aucune donnée réelle.
