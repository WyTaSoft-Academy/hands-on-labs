# TP 4b, bonus 1 — Moyennes journalières, un onglet Excel par quartier

Ce guide explique, morceau par morceau, le code du bonus 1 de l'[énoncé du TP 4b](enonce-4b.md) :

> Moyennes journalières par capteur (`resample("D")`), exportées dans un classeur Excel,
> un onglet par quartier (`pd.ExcelWriter`).

```python
jour = (m.set_index("horodatage").groupby("capteur")["no2"]
          .resample("D").mean().round(1).unstack("capteur"))
with pd.ExcelWriter("journalier.xlsx") as xl:
    for q, ids in cap.groupby("quartier")["id"]:
        jour[ids.tolist()].to_excel(xl, sheet_name=q)
print(jour.shape)
```

On part de :

- `m` : les 8 064 mesures horaires, **après** l'interpolation de l'étape 2 (plus aucun NO2
  manquant), avec `horodatage` lu comme date (`parse_dates=["horodatage"]`) ;
- `cap` : la table des 12 capteurs, lue à l'étape 3 avec `pd.read_sql`
  (voir [`classer-et-joindre.md`](classer-et-joindre.md)).

Les sorties ci-dessous sont celles de `../donnees/mesures.csv`, obtenues en exécutant le code.

---

## Vue d'ensemble

Le code fait deux choses :

1. **Calculer** un tableau `jour` : une ligne par **jour** (28), une colonne par **capteur**
   (12), et dans chaque case le NO2 moyen de ce capteur ce jour-là.
2. **Exporter** ce tableau dans un fichier Excel, `journalier.xlsx`, en le découpant : un
   **onglet par quartier**, chacun avec les colonnes de ses 3 capteurs.

On passe de 8 064 lignes horaires à 28 × 12 = 336 moyennes journalières : c'est un
**changement de pas de temps**, de l'heure au jour.

---

## Partie A — Calculer les moyennes journalières

La première instruction est une chaîne de six méthodes. Les **parenthèses** qui l'entourent
permettent de l'écrire sur plusieurs lignes ; on la lit étape par étape.

### 1. Mettre les dates en index : `set_index("horodatage")`

```python
m.set_index("horodatage")
```

`resample` (étape 3) regroupe les lignes **par période de temps**. Pour cela, il lui faut des
dates **dans l'index**, la colonne d'étiquettes à gauche du tableau. `set_index` déplace la
colonne `horodatage` dans l'index :

```
DatetimeIndex(['2026-03-02 00:00:00', '2026-03-02 01:00:00', ...], name='horodatage')
```

Sans cette étape, l'index est la simple numérotation 0, 1, 2…, et `resample` refuse :

```
TypeError: Only valid with DatetimeIndex, TimedeltaIndex or PeriodIndex,
but got an instance of 'RangeIndex'
```

> **Il faut des vraies dates.** Si `horodatage` est resté du texte (lecture sans
> `parse_dates`), l'index n'est pas un `DatetimeIndex` et la même erreur apparaît. Convertissez
> d'abord avec `pd.to_datetime`.

`set_index` rend une **nouvelle** table : `m` lui-même garde son index d'origine.

### 2. Séparer les capteurs : `groupby("capteur")`

```python
.groupby("capteur")
```

On veut une moyenne **par capteur** et par jour. Sans ce `groupby`, `resample` ferait la
moyenne de **tous** les capteurs ensemble, jour par jour : une seule série pour la ville.

### 3. Garder le NO2 : `["no2"]`

```python
["no2"]
```

Seule la colonne NO2 nous intéresse. On la sélectionne **avant** de calculer, pour ne pas
faire la moyenne de colonnes inutiles (et pour éviter une erreur sur les colonnes de texte,
comme `quartier`).

### 4. Regrouper par jour : `resample("D")`

```python
.resample("D")
```

`resample` découpe la série en **tranches de temps** régulières. `"D"` (*day*) veut dire :
une tranche par jour calendaire, de minuit à minuit. Chaque tranche contient les 24 mesures
horaires de la journée.

C'est un `groupby`, mais **sur le temps** : au lieu de regrouper par valeur d'une colonne, on
regroupe par période. Autres pas de temps courants :

| Code | Période |
|---|---|
| `"h"` | heure |
| `"D"` | jour |
| `"W"` | semaine (finissant le dimanche) |
| `"MS"` | mois (étiqueté au premier du mois) |

Comme pour `groupby`, rien n'est calculé à ce stade : il faut dire **quoi** calculer.

### 5. Calculer et arrondir : `.mean().round(1)`

```python
.mean().round(1)
```

`.mean()` fait la moyenne des 24 mesures de chaque jour, pour chaque capteur. Le résultat est
une **série** de 336 valeurs, repérée par **deux** niveaux d'index, le capteur puis le jour :

```
capteur  horodatage
AQ-01    2026-03-02    27.704167
         2026-03-03    29.650000
         2026-03-04    28.220833
...
```

`.round(1)` arrondit au dixième, la précision des mesures.

> **Vérification à la main :** les 24 mesures d'AQ-03 du 2 mars ont pour moyenne
> 32,854… ; dans `jour`, la case vaut **32.9**.

> **Un arrondi surprenant :** `29.65` devient `29.6`, pas `29.7`. Un nombre à virgule est
> stocké en binaire, et `29.65` y vaut en réalité 29,6499999… : l'arrondi descend. Ce n'est
> pas une erreur de pandas, c'est le calcul en virgule flottante.

### 6. Mettre les capteurs en colonnes : `unstack("capteur")`

```python
.unstack("capteur")
```

La série a deux niveaux d'index, capteur et jour : c'est une longue colonne de 336 valeurs,
pratique pour calculer, peu lisible. `unstack("capteur")` fait **pivoter** le niveau
`capteur` : chaque capteur devient une **colonne**, et il ne reste que les jours en lignes.

Avant (`stack`, en long) :

```
capteur  horodatage
AQ-01    2026-03-02    27.7
AQ-01    2026-03-03    29.6
AQ-02    2026-03-02    29.6
...
```

Après (`unstack`, en large) :

```
capteur     AQ-01  AQ-02  AQ-03  AQ-04  ...
horodatage
2026-03-02   27.7   29.6   32.9   29.6
2026-03-03   29.6   28.8   34.6   30.4
2026-03-04   28.2   30.6   33.5   30.3
...
```

C'est le même résultat qu'un `pivot_table(index=jour, columns="capteur", values="no2")` : un
tableau à double entrée, jours × capteurs.

### Le résultat : `jour`

```python
print(jour.shape)            # (28, 12)
```

**28 lignes** (les jours du 2 au 29 mars) et **12 colonnes** (les capteurs AQ-01 à AQ-12).
L'index est un `DatetimeIndex` de pas `"D"`.

---

## Partie B — Exporter dans Excel, un onglet par quartier

### 7. Ouvrir le classeur : `pd.ExcelWriter`, dans un `with`

```python
with pd.ExcelWriter("journalier.xlsx") as xl:
    ...
```

- `pd.ExcelWriter("journalier.xlsx")` prépare un classeur Excel, et le nomme `xl`.
- Un simple `jour.to_excel("journalier.xlsx")` écrirait **un seul** onglet, et chaque nouvel
  appel **écraserait** le fichier. L'`ExcelWriter` garde le classeur ouvert, pour y ajouter
  **plusieurs** onglets.
- Le `with` est le même que pour `open` : à la sortie du bloc, le classeur est **enregistré et
  fermé** automatiquement. Sans `with`, il faudrait appeler `xl.close()` soi-même, et un
  oubli donnerait un fichier vide ou illisible.

> **Prérequis :** pandas écrit le `.xlsx` avec la bibliothèque **openpyxl**. Elle est dans
> l'environnement `aircite` ; ailleurs, `ModuleNotFoundError: No module named 'openpyxl'` se
> corrige par `python -m pip install openpyxl`.

### 8. Parcourir les quartiers : `cap.groupby("quartier")["id"]`

```python
for q, ids in cap.groupby("quartier")["id"]:
```

Ici, `groupby` ne sert pas à calculer : on **parcourt** les groupes avec une boucle `for`.
À chaque tour, il rend deux choses, rangées dans deux variables :

- `q` : le nom du groupe, c'est-à-dire le quartier (`"Centre"`, `"Gare"`…) ;
- `ids` : la colonne `id` des capteurs de ce quartier, sous forme de série.

Les quatre tours :

| `q` | `ids.tolist()` |
|---|---|
| `Centre` | `['AQ-01', 'AQ-02', 'AQ-03']` |
| `Gare` | `['AQ-04', 'AQ-05', 'AQ-06']` |
| `Port` | `['AQ-07', 'AQ-08', 'AQ-09']` |
| `Université` | `['AQ-10', 'AQ-11', 'AQ-12']` |

On utilise `cap` (la table des capteurs) et non `m` (les mesures) : la correspondance
capteur → quartier y est directe, une ligne par capteur, sans 672 répétitions.

### 9. Choisir les colonnes du quartier : `jour[ids.tolist()]`

```python
jour[ids.tolist()]
```

- `ids.tolist()` transforme la série en **liste** Python : `['AQ-01', 'AQ-02', 'AQ-03']`.
- `jour[liste]` garde **ces colonnes-là**, dans cet ordre : les 28 jours des 3 capteurs du
  quartier.

> **Pourquoi `tolist()` ?** `jour[ids]` fonctionne aussi : pandas prend les valeurs de la
> série comme noms de colonnes. Mais la **liste** est la forme habituelle pour dire « ces
> colonnes », et elle se lit sans connaître ce détail.

### 10. Écrire l'onglet : `to_excel(xl, sheet_name=q)`

```python
jour[ids.tolist()].to_excel(xl, sheet_name=q)
```

- `to_excel(xl, ...)` écrit le tableau **dans le classeur ouvert** `xl`, au lieu de créer un
  fichier.
- `sheet_name=q` nomme l'onglet d'après le quartier.
- L'**index** (les dates) est écrit en première colonne, avec son nom `horodatage` en
  en-tête. Pour ne pas l'écrire : `index=False`, mais ici les dates sont indispensables.

> **Les noms d'onglets** sont limités par Excel à **31 caractères**, sans `/ \ ? * [ ] :`.
> Les noms de quartiers conviennent ; un nom plus long ferait échouer l'écriture.

### 11. Contrôler : `print(jour.shape)`

```python
print(jour.shape)            # (28, 12)
```

Un dernier contrôle : 28 jours, 12 capteurs. Si le nombre de lignes n'était pas 28, il
manquerait des jours, ou l'index ne serait pas fait de dates.

---

## Le fichier obtenu

`journalier.xlsx` contient **4 onglets**, dans l'ordre alphabétique des quartiers :
`Centre`, `Gare`, `Port`, `Université`. Chacun a **28 lignes** de données et **4 colonnes** :
la date, puis les 3 capteurs du quartier.

Onglet `Centre` :

| horodatage | AQ-01 | AQ-02 | AQ-03 |
|---|---|---|---|
| 2026-03-02 | 27.7 | 29.6 | 32.9 |
| 2026-03-03 | 29.6 | 28.8 | 34.6 |
| … | … | … | … |

Pour le relire en Python :

```python
pd.read_excel("journalier.xlsx", sheet_name="Centre")      # un onglet
pd.read_excel("journalier.xlsx", sheet_name=None)          # tous : un dictionnaire onglet → DataFrame
```

---

## À retenir

| Écriture | Effet |
|---|---|
| `set_index("horodatage")` | Les dates dans l'index : indispensable pour `resample` |
| `groupby("capteur")["no2"].resample("D").mean()` | Une moyenne par capteur et par jour |
| `.unstack("capteur")` | Le niveau `capteur` passe en colonnes : un tableau jours × capteurs |
| `with pd.ExcelWriter("f.xlsx") as xl:` | Un classeur ouvert pour plusieurs onglets, enregistré à la sortie du `with` |
| `for q, ids in cap.groupby("quartier")["id"]:` | Parcourir les groupes : le nom, puis les lignes du groupe |
| `df[liste].to_excel(xl, sheet_name=q)` | Écrire certaines colonnes dans un onglet nommé |
