# TP 5 : un job qui absorbe les arrivées quotidiennes

**Module 7 · ≈ 50 min · individuel · restitution 7 min**

Depuis le 1<sup>er</sup> juillet, la Banque Lumen dépose chaque jour un fichier dans
`banque/arrivees/` : les opérations nouvelles du jour (`VALIDEE`), et des **annulations**
d'opérations déjà reçues (même `transaction_id`, `statut = 'ANNULEE'`). Vous l'avez vu au bonus
du TP 1.

Vous construisez le traitement quotidien :

1. un notebook **paramétré par le jour**, qui applique le fichier à `silver.transactions` par
   `MERGE` ;
2. un notebook qui **recalcule la gold** à partir de juin ;
3. un **job** qui enchaîne les deux.

Point de départ : `silver.transactions` à **3 200** lignes (fin du module 6). Remplacez
`stagiaire01` par votre compte et `<stockage>` par le nom du storage account.

---

## Partie A · Azure Data Factory (démonstration, pendant l'exposé)

Pendant la séquence 4 du module, le formateur lance, depuis un pipeline ADF, **le même notebook** que celui de l'étape 1, sur son
propre catalog. Notez :

1. Où ADF trouve-t-il le notebook, et avec quelle identité se connecte-t-il au workspace ?
2. Comment le jour à traiter arrive-t-il dans le notebook ?
3. Où lit-on, dans ADF, ce que le notebook a renvoyé ?

---

## Partie B · À vous

### Étape 1 · Le notebook `tp5-arrivee` (≈ 15 min)

Un notebook Python, dans votre dossier, attaché à votre cluster.

1. Trois widgets texte : `catalog` (défaut `lumen_stagiaire01`), `jour` (défaut `2026-07-01`),
   `stockage` (défaut : le nom du storage account). Lisez leurs valeurs, puis
   `spark.sql(f"USE CATALOG {catalog}")`.
2. Lisez le fichier `abfss://formation@<stockage>.dfs.core.windows.net/banque/arrivees/transactions_<jour>.csv`
   avec `read_files` (CSV à virgules, avec en-tête), en sélectionnant les 11 colonnes de
   `silver.transactions`, **avec les mêmes noms**, avec `horodatage` en `TIMESTAMP` et `montant` en
   `DOUBLE`. Faites-en la vue temporaire `arrivee`. Combien de lignes, combien d'annulations ?
3. Écrivez le `MERGE` de `arrivee` dans `silver.transactions`, sur `transaction_id` :
   - une annulation d'une opération existante, **pas encore annulée** : son statut passe à
     `ANNULEE` ;
   - une opération nouvelle et `VALIDEE` : elle est insérée.
4. Récupérez les métriques du `MERGE` (`num_updated_rows`, `num_inserted_rows`), affichez-les, et
   terminez par `dbutils.notebook.exit(…)` avec un petit JSON (`jour`, `mises_a_jour`,
   `insertions`).
5. Exécutez le notebook **à la main**, pour le 1<sup>er</sup> juillet. Combien de mises à jour,
   d'insertions ? Combien de lignes dans `silver.transactions` ?

### Étape 2 · Le notebook `tp5-gold` (≈ 10 min)

Un notebook **SQL**, avec un widget `catalog` (en SQL : `CREATE WIDGET TEXT catalog DEFAULT
'lumen_stagiaire01'`, puis `USE CATALOG IDENTIFIER(:catalog)`).

Une seule commande : `INSERT INTO gold.flux_mensuels REPLACE WHERE mois >= DATE'2026-06-01'`,
suivie du `SELECT` de la gold du TP 4, avec deux filtres de plus : les opérations `VALIDEE`
seulement, et à partir du 1<sup>er</sup> juin.

Pourquoi recalculer juin, et pas seulement juillet ? Exécutez le notebook à la main.

### Étape 3 · Le job (≈ 10 min)

*Jobs & Pipelines* → *Create* → *Job*, nommé `lumen-quotidien-stagiaire01`.

1. Tâche `arrivee` : type *Notebook*, `tp5-arrivee`. Compute : **Serverless** si le workspace le
   propose, sinon votre cluster `cl-stagiaire01`.
2. Tâche `gold` : type *Notebook*, `tp5-gold`, **dépend de** `arrivee`, même compute.
3. *Job parameters* : `catalog` = `lumen_stagiaire01`, `jour` = `2026-07-02`, `stockage` = le nom
   du storage account.
4. *Run now*. Suivez l'exécution : quelle tâche démarre quand ? Ouvrez la sortie de `arrivee`.
5. *Run now with different parameters* : `jour` = `2026-07-03`.

### Étape 4 · Le rejeu (≈ 5 min)

Relancez le job avec `jour` = `2026-07-01`, un jour **déjà traité** à l'étape 1. Que disent les
métriques du `MERGE` ? Le nombre de lignes de la silver a-t-il changé ? Et la gold ?

### Étape 5 · L'échec, et sa réparation (≈ 5 min)

1. Relancez avec `jour` = `2026-07-04`. Le fichier n'existe pas. Que devient chaque tâche ? Lisez
   l'erreur.
2. Sur la page de l'exécution en échec : *Repair run*, avec `jour` = `2026-07-03`. Quelles tâches
   sont relancées ? Que changent-elles ?

   *En production, on réparerait avec le même jour, une fois le fichier arrivé. Ici, faute de
   fichier du 4 juillet, on rejoue un jour déjà traité : c'est aussi un test d'idempotence.*

### Étape 6 · Le planning (≈ 5 min)

1. *Schedules & Triggers* → *Add trigger* → *Scheduled* : tous les jours à 6h00, fuseau
   *Europe/Paris*. Puis **mettez-le en pause**.
2. Dans *Job parameters*, remplacez la valeur de `jour` par `{{job.start_time.iso_date}}`.
   Pourquoi est-ce la valeur de production ? Pourquoi ne faut-il pas lancer le job maintenant ?
   Remettez `2026-07-03`.
3. *Job notifications* : un e-mail à vous-même en cas d'échec.

### Bonus (hors temps, si vous avez fini en avance)

1. **Task values.** Dans `tp5-arrivee`, avant `exit`, publiez le nombre d'insertions :
   `dbutils.jobs.taskValues.set("insertions", n_ins)`. Ajoutez entre les deux tâches une tâche
   *If/else condition* : `{{tasks.arrivee.values.insertions}} > 0`, et ne lancez `gold` que si
   elle est vraie. Rejouez le 1<sup>er</sup> juillet : que se passe-t-il ?
2. **Le job en code.** Sur la page du job : *View as code* (YAML ou JSON). Comparez avec
   la définition présentée en restitution.

---

## Ce qu'on attend en fin de TP

| Exécution | Mises à jour | Insertions | Lignes de la silver |
|---|---|---|---|
| 1<sup>er</sup> juillet, à la main | | | |
| 2 juillet, job | | | |
| 3 juillet, job | | | |
| 1<sup>er</sup> juillet, rejoué | | | |
| 4 juillet | | | |
| Repair run, 3 juillet | | | |

Et dans la gold : les opérations de juin et de juillet. Combien de lignes compte la gold ?
Combien en attendiez-vous, et pourquoi ? Pour comprendre un éventuel écart, comptez les agences
par mois (`SELECT mois, COUNT(*) … GROUP BY mois`).

Ne supprimez rien : le TP 6 de cet après-midi interroge votre silver et votre gold.
