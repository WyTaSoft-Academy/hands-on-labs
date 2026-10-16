# TP 4b, étape 3 — Classer, et joindre la table des capteurs, pas à pas

Ce guide détaille l'étape 3 de l'[énoncé du TP 4b](enonce-4b.md) :

> **Classer.** NO2 moyen et maximum par quartier, triés ; puis par capteur avec son nom,
> en joignant la table `capteurs` (`pd.read_sql` + `merge`). Vérifiez que la jointure
> garde 8 064 lignes.

On part du DataFrame `m` de l'étape 2, **après** l'interpolation : 8 064 lignes, plus aucun
NO2 manquant (voir [`interpoler-par-capteur.md`](interpoler-par-capteur.md)). Les chiffres
ci-dessous sont ceux de `../donnees/mesures.csv` et `../donnees/capteurs.db`.

```python
import sqlite3
import pandas as pd

DONNEES = "../donnees/"
```

---

## Partie A — Le NO2 par quartier

### 1. Grouper par quartier

```python
m.groupby("quartier")["no2"]
```

Comme à l'étape 2 : `groupby("quartier")` range les lignes en 4 paquets (Centre, Gare, Port,
Université), et `["no2"]` garde la colonne NO2 de chaque paquet. Rien n'est encore calculé :
il faut dire **quoi** calculer sur chaque paquet.

### 2. Deux calculs d'un coup : `agg`

```python
m.groupby("quartier")["no2"].agg(["mean", "max"])
```

```
                 mean   max
quartier
Centre      28.989311  72.5
Gare        28.371305  70.8
Port        21.413318  58.6
Université  12.945511  38.6
```

- `.mean()` seul donnerait une seule colonne. `agg([...])` applique **plusieurs** calculs, et
  rend une colonne par calcul.
- Le résultat a **une ligne par quartier** : c'est la différence avec `transform`, qui rendait
  une ligne par mesure.

### 3. Arrondir, puis trier

```python
par_quartier = (m.groupby("quartier")["no2"].agg(["mean", "max"])
                  .round(1)
                  .sort_values("mean", ascending=False))
print(par_quartier)
```

```
            mean   max
quartier
Centre      29.0  72.5
Gare        28.4  70.8
Port        21.4  58.6
Université  12.9  38.6
```

- `.round(1)` arrondit au dixième, la précision des mesures.
- `.sort_values("mean", ascending=False)` trie sur la colonne `mean`, du plus pollué au moins
  pollué.
- Les **parenthèses** autour de l'ensemble permettent d'écrire une méthode par ligne. Sans
  elles, Python s'arrête à la fin de la première ligne et signale une erreur.

> **Des noms de colonnes en français ?** `agg` accepte des noms au choix :
> `agg(moyenne="mean", maximum="max")`, puis `sort_values("moyenne", ascending=False)`.
> Le résultat est le même, avec des colonnes `moyenne` et `maximum`.

**Lecture :** Centre et Gare sont les plus exposés, à quasi-égalité ; l'Université respire
deux fois mieux. Le maximum, lui, dit autre chose que la moyenne : un pic isolé.

---

## Partie B — Le NO2 par capteur, avec son nom

`mesures.csv` ne contient que l'**identifiant** du capteur (`AQ-03`). Son **nom** (`Rue Neuve`)
est dans la base SQLite `capteurs.db`. Il faut aller le chercher, puis le rattacher à chaque
mesure : c'est une **jointure**.

### 4. Lire la table `capteurs` : `pd.read_sql`

```python
connexion = sqlite3.connect(DONNEES + "capteurs.db")
cap = pd.read_sql("SELECT id, nom, quartier, lat, lon FROM capteurs", connexion)
print(cap)
```

```
       id                    nom    quartier      lat     lon
0   AQ-01         Hôtel de Ville      Centre  45.7640  4.8357
1   AQ-02       Place des Halles      Centre  45.7652  4.8380
2   AQ-03              Rue Neuve      Centre  45.7628  4.8331
...
11  AQ-12                  Stade  Université  45.7830  4.8688
```

- `sqlite3.connect(...)` ouvre la base : c'est le module du TP 2b, livré avec Python.
- `pd.read_sql(requête, connexion)` exécute la requête SQL et rend directement un DataFrame :
  plus besoin de `cursor`, `execute` et `fetchall`.
- `cap` a **12 lignes**, une par capteur.

> **`no such table: capteurs` ?** Le chemin ne mène pas à la base : `connect` crée alors un
> fichier vide au lieu de lever une erreur. Vérifiez le chemin `../donnees/capteurs.db`, et
> supprimez le fichier vide créé par erreur.

### 5. Joindre : `merge`

```python
t = m.merge(cap[["id", "nom"]], left_on="capteur", right_on="id", how="left")
```

On colle à chaque ligne de `m` le nom de son capteur. Morceau par morceau :

| Morceau | Ce qu'il fait |
|---|---|
| `m.merge(...)` | `m` est la table **de gauche** : celle qu'on complète |
| `cap[["id", "nom"]]` | La table **de droite**, réduite aux deux colonnes utiles |
| `left_on="capteur"` | Dans `m`, la clé s'appelle `capteur` |
| `right_on="id"` | Dans `cap`, la même clé s'appelle `id` |
| `how="left"` | Garder **toutes** les lignes de `m`, même sans capteur correspondant |

C'est l'équivalent SQL de :

```sql
SELECT m.*, cap.id, cap.nom
FROM m LEFT JOIN cap ON m.capteur = cap.id
```

`t` a les colonnes de `m`, plus `id` et `nom`. La colonne `id` répète `capteur` : on peut la
retirer avec `t = t.drop(columns="id")`.

**Pourquoi `cap[["id", "nom"]]` et pas `cap` entier ?** `m` et `cap` ont tous les deux une
colonne `quartier`. Si on joint `cap` entier, pandas renomme les deux en `quartier_x` et
`quartier_y`, et `t["quartier"]` lève une `KeyError`. On ne prend que ce dont on a besoin.

### 6. Vérifier : la jointure garde 8 064 lignes

```python
print(len(m), len(t))        # 8064 8064
assert len(t) == len(m)
```

`assert` ne fait rien si la condition est vraie, et arrête le programme avec une
`AssertionError` si elle est fausse. C'est un contrôle automatique.

**Pourquoi le nombre de lignes pourrait changer ?** Deux pièges classiques :

| Piège | Ce qui arrive | Ici |
|---|---|---|
| Un identifiant en **double** dans `cap` | Chaque mesure de ce capteur est **dupliquée** : avec AQ-01 en double, 8 736 lignes au lieu de 8 064 | `cap` a 12 identifiants uniques |
| Un capteur de `m` **absent** de `cap`, avec `how="inner"` (le défaut) | Ses mesures **disparaissent** de la jointure | Les 12 capteurs de `m` sont dans `cap` |

Si `len(t)` vaut 8 064, aucune mesure n'a été perdue, et aucune n'a été comptée deux fois.
Toutes les moyennes qui suivent sont donc justes. Avec `how="left"`, un capteur inconnu
garderait ses lignes, avec un `nom` vide (`NaN`) : on le verrait, au lieu de le perdre
sans bruit.

### 7. Classer les capteurs

```python
par_capteur = (t.groupby(["capteur", "nom"])["no2"].mean()
                .round(1)
                .sort_values(ascending=False))
print(par_capteur)
```

```
capteur  nom
AQ-03    Rue Neuve                31.6
AQ-05    Boulevard Ferroviaire    30.3
AQ-04    Parvis de la Gare        28.8
AQ-02    Place des Halles         28.4
AQ-01    Hôtel de Ville           27.0
AQ-06    Pont du Chemin           26.0
AQ-09    Bassin Sud               23.2
AQ-08    Écluse Nord              21.7
AQ-07    Quai des Docks           19.3
AQ-11    Bibliothèque             14.3
AQ-10    Campus Est               12.7
AQ-12    Stade                    11.8
```

- `groupby(["capteur", "nom"])` groupe sur **deux** colonnes. Chaque capteur n'a qu'un nom,
  donc ça donne toujours 12 groupes ; le nom est simplement gardé dans le résultat.
- Ici, `mean()` rend une **série** (une seule colonne), donc `sort_values` n'a pas besoin de
  nom de colonne : `sort_values(ascending=False)` suffit.

**Lecture :** la Rue Neuve, dans le Centre, est le capteur le plus exposé. Le classement par
capteur nuance celui par quartier : le 2ᵉ capteur, Boulevard Ferroviaire, est dans le quartier
Gare.

---

## Le code complet de l'étape

```python
par_quartier = (m.groupby("quartier")["no2"].agg(["mean", "max"])
                  .round(1).sort_values("mean", ascending=False))
print(par_quartier)

cap = pd.read_sql("SELECT id, nom, quartier, lat, lon FROM capteurs",
                  sqlite3.connect(DONNEES + "capteurs.db"))
t = m.merge(cap[["id", "nom"]], left_on="capteur", right_on="id", how="left")
assert len(t) == len(m)          # ni ligne perdue, ni ligne dupliquée
print(t.groupby(["capteur", "nom"])["no2"].mean().round(1).sort_values(ascending=False))
```

---

## À retenir

| Écriture | Effet |
|---|---|
| `groupby(...)["no2"].agg(["mean", "max"])` | Plusieurs calculs par groupe, une ligne par groupe |
| `.sort_values("mean", ascending=False)` | Trier un tableau sur une colonne, du plus grand au plus petit |
| `pd.read_sql(requête, connexion)` | Une requête SQL qui rend un DataFrame |
| `m.merge(cap, left_on=..., right_on=..., how="left")` | Rattacher à chaque ligne les colonnes d'une autre table |
| `assert len(t) == len(m)` | Prouver que la jointure n'a ni perdu ni dupliqué de lignes |
