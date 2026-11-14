# TP 2 : un cluster à soi, sous policy

**Module 3 · ≈ 35 min · individuel · restitution 5 min**

Au TP 1, la Banque Lumen a été lue par le **SQL warehouse partagé**. Pour les notebooks des TP
suivants, chacun a besoin de **son** compute : un cluster all-purpose, single node, encadré par la
cluster policy de la formation. Dans ce TP, vous le créez, vous reconnaissez les autres types de
compute pendant qu'il démarre, vous y lisez les transactions, vous l'observez, et vous l'arrêtez.

Remplacez `stagiaire01` par votre compte et `<stockage>` par le nom du storage account (le même
qu'au TP 1).

---

## Étape 1 · Créer son cluster (≈ 5 min)

*Compute* → *Create compute*.

| Champ | Valeur |
|---|---|
| Compute name | `cl-stagiaire01` |
| Policy | `dki-stagiaire` (à choisir **en premier** : le formulaire se met à jour) |
| Databricks runtime | la version **LTS** proposée par défaut (18 LTS) |
| Photon acceleration | laissez la valeur proposée |
| Preferred node type | `Standard_D4ds_v5` (16 GB, 4 cœurs), seule valeur possible |
| Terminate after | 20 minutes |

Avant de cliquer *Create* :

1. Quels champs du formulaire de la slide « champ par champ » **n'apparaissent pas** ? Pourquoi ?
2. Relevez la consommation affichée dans le récapitulatif, en **DBU par heure**. Décochez *Photon
   acceleration* : la consommation change-t-elle ? Recochez-la.
3. Essayez de mettre l'auto-termination à **60** minutes. Que se passe-t-il ?

Puis *Create*. Le cluster passe en *Pending* : il met **une dizaine de minutes** à démarrer (Azure
fournit la VM, puis le runtime s'installe). **N'attendez pas**, passez tout de suite à l'étape 2.

## Étape 2 · Pendant qu'il démarre : les types de compute (≈ 7 min)

Dans *Compute*, parcourez les onglets.

1. Quels **types de compute** la page propose-t-elle (les onglets en haut) ? Pour chacun, dites en une
   phrase à quoi il sert. Lesquels sont au programme ?
2. Onglet *SQL warehouses* : le warehouse `wh-dki-formation`, celui du TP 1. Relevez son **type**, sa
   **size**, son **scaling** (min et max clusters) et son **auto stop**. Est-il démarré en ce
   moment ?
3. Onglet *Policies* (ou le lien de la policy, dans votre cluster) : ouvrez `dki-stagiaire`, onglet
   *Definitions*. Quels champs sont **fixes** (`fixed`), lesquels sont **limités à une liste**
   (`allowlist`), lesquels sont **libres** (`unlimited`) ? Retrouvez-y la réponse à la question 3 de
   l'étape 1.
4. Pourriez-vous créer un cluster **sans** cette policy ? Essayez.

## Étape 3 · Un premier notebook (≈ 10 min)

Quand le cluster est *Running* : *Workspace* → votre dossier personnel → *Create* → *Notebook*,
nommé `tp2-cluster`. En haut du notebook, attachez-le à `cl-stagiaire01`.

Cellule 1, en Python :

```python
chemin = "abfss://formation@<stockage>.dfs.core.windows.net/banque/transactions/"
df = spark.read.parquet(chemin)
df.count()
```

Cellule 2 : le nombre de lignes **par fichier**, avec la colonne cachée `_metadata` :

```python
display(df.groupBy("_metadata.file_name").count().orderBy("file_name"))
```

Cellule 3 : le même comptage qu'en cellule 1, mais **en SQL**, dans le même notebook. La première
ligne de la cellule est `%sql` ; la requête utilise `read_files`, comme au TP 1.

Questions :

1. Le nombre de lignes est-il le même qu'au TP 1 sur le SQL warehouse ? Qu'est-ce qui a changé
   entre les deux lectures, et qu'est-ce qui n'a pas changé ?
2. Relancez la cellule 1. La deuxième exécution est-elle plus rapide ? Pourquoi, à votre avis ?

## Étape 4 · Observer (≈ 5 min)

1. Sous la cellule 1, dépliez *Spark Jobs* et ouvrez le job (*View*). Combien de **tasks** a-t-il
   fallu pour lire les six fichiers ?
2. Page du cluster → *Spark UI* → onglet *Executors*. Combien d'executors ? Combien de cœurs ?
   Qu'est-ce que cela dit d'un cluster single node ?
3. Page du cluster → *Event log*. Quels événements voyez-vous depuis la création ? Combien de temps
   s'est-il écoulé entre `CREATING` et `RUNNING` ?

## Étape 5 · Arrêter (≈ 2 min)

Page du cluster → *Terminate*. Puis, dans l'*Event log* : quel événement est apparu, et avec quelle
raison ?

Retournez dans le notebook : les cellules et leurs résultats affichés sont-ils toujours là ? Et la
variable `df` ?

## Bonus

1. **Le notebook sur le SQL warehouse.** Attachez `tp2-cluster` à `wh-dki-formation` au lieu de votre
   cluster. Exécutez la cellule SQL, puis la cellule Python. Que se passe-t-il ?
2. **Votre voisin sur votre cluster.** Votre cluster redémarré, donnez à votre voisin la permission
   `CAN ATTACH TO` (page du cluster → *Permissions*). Il attache un de ses notebooks à **votre**
   cluster et exécute une cellule. Que se passe-t-il, et pourquoi ? Pensez à **arrêter** votre
   cluster après.
3. **La définition JSON.** Menu *⋮* de votre cluster → *View JSON*. Retrouvez-y ce que la policy a
   imposé.

---

## Ce qu'on attend en fin de TP

| Mesure | Votre résultat |
|---|---|
| Consommation affichée à la création (DBU/h), avec et sans Photon | |
| Auto-termination à 60 min | |
| Durée du démarrage (`CREATING` → `RUNNING`) | |
| Lignes lues en Python / en SQL | |
| Lignes du plus petit et du plus gros fichier | |
| Executors et cœurs dans la Spark UI | |
| Raison du dernier arrêt, dans l'Event log | |

Et votre cluster **arrêté** (*Terminated*). Il ne sera pas supprimé : vous le redémarrerez au TP 4.
