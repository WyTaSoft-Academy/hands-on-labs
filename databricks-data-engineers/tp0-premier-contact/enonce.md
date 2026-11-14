# TP 0 : premier contact avec le workspace

**Module 1 · ≈ 30 min, restitution comprise · individuel**

Avant de construire quoi que ce soit pour la Banque Lumen, on fait connaissance avec l'outil : où
sont les choses, comment on lance une requête, et ce qui se passe quand on n'a pas le droit. On ne
crée rien, et on n'ouvre pas encore les fichiers de la banque : c'est le TP 1, cet après-midi.

Tout se fait dans le **SQL editor**, sur le SQL warehouse partagé `wh-dki-formation`.

---

## Étape 1 · Se connecter, régler l'interface (≈ 3 min)

1. Ouvrez l'URL du workspace donnée par le formateur (`adb-….azuredatabricks.net`) et connectez-vous
   avec votre compte de formation.
2. En haut à droite, votre profil → *Settings* → *Preferences* → *Language* : **English**. Les
   slides et la documentation emploient les noms anglais de l'interface.

## Étape 2 · Le tour de la barre latérale (≈ 5 min)

Trouvez, et notez :

1. Dans *SQL Warehouses* : le warehouse `wh-dki-formation`. Son **type**, sa **size**, son **auto
   stop**. Est-il démarré ?
2. Dans *Workspace* : le chemin de **votre dossier personnel**.
3. Dans *Catalog* : la liste des **catalogs** que vous voyez.
4. Dans *Compute* : y a-t-il déjà des clusters ? Quelles **policies** vous sont proposées ?
5. Dans *Jobs & Pipelines* : y a-t-il déjà des jobs ?

## Étape 3 · Le Catalog Explorer (≈ 5 min)

Ouvrez `samples` → `nyctaxi` → `trips`.

1. Onglet *Columns* : combien de colonnes ? Quel type pour `tpep_pickup_datetime`, pour
   `fare_amount`, pour `pickup_zip` ?
2. Onglet *Sample data* : à quoi ressemble une course ?
3. Onglet *Details* : quel **type** de table ? Qui en est l'**owner** ?

## Étape 4 · Trois requêtes, un graphique (≈ 7 min)

Dans le *SQL Editor*, warehouse `wh-dki-formation` :

1. `SELECT current_user(), current_catalog();` : qui êtes-vous, et quel est le catalog par défaut ?
2. Le nombre de courses de `samples.nyctaxi.trips`.
3. Les cinq codes postaux de départ (`pickup_zip`) les plus fréquents, avec le nombre de courses et
   le prix moyen (`fare_amount`), arrondi au centime.
4. Sous le résultat de la troisième requête : *+* → *Visualization*, un graphique en barres des
   courses par code postal.

## Étape 5 · Une limite (≈ 3 min)

Essayez d'écrire dans le catalog `samples` :

```sql
CREATE TABLE samples.nyctaxi.essai AS SELECT 1 AS x;
```

Lisez le message d'erreur. **Qui** vous refuse, et que dit le message ?

## Étape 6 · L'historique (≈ 3 min)

1. *Query history* : retrouvez vos requêtes de l'étape 4. Laquelle a pris le plus de temps ?
2. Ouvrez le **query profile** de la troisième. Combien de lignes ont été lues ?

---

## Ce qu'on attend en fin de TP

| Question | Votre réponse |
|---|---|
| Type, size et auto stop de `wh-dki-formation` | |
| Les catalogs que vous voyez | |
| L'owner de `samples.nyctaxi.trips` | |
| Le nombre de courses | |
| Le code postal de départ le plus fréquent | |
| Qui refuse l'écriture dans `samples`, et pourquoi | |
