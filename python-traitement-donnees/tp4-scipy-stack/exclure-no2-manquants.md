# Exclure les lignes où le NO2 manque

Dans `mesures.csv`, une mesure de NO2 absente est une cellule vide. pandas la lit comme
`NaN` (*Not a Number*), c'est-à-dire « valeur absente ». Ce guide montre comment retirer ces
lignes du DataFrame, et quand il vaut mieux ne pas le faire.

Les chiffres sont ceux de `../donnees/mesures.csv` :

```python
import pandas as pd

m = pd.read_csv("../donnees/mesures.csv", parse_dates=["horodatage"])
len(m)                       # 8064 lignes
m["no2"].isna().sum()        # 151 NO2 manquants
```

---

## 1. La façon la plus directe : `dropna(subset=...)`

```python
m = m.dropna(subset=["no2"])
len(m)                       # 7913
```

- `dropna` retire les lignes qui contiennent un `NaN`.
- `subset=["no2"]` limite la recherche à la colonne `no2`. Une ligne dont **seule** une
  autre colonne est vide est gardée.
- Comme `sort_values`, `dropna` **rend une nouvelle table** : sans le `m = ...`, rien ne change.

8 064 − 151 = **7 913** lignes : le compte est bon.

## 2. La même chose avec un filtre

```python
m = m[m["no2"].notna()]
```

Se lit en deux temps :

1. `m["no2"].notna()` rend une colonne de `True` / `False` : `True` quand le NO2 est présent.
2. `m[...]` garde seulement les lignes où c'est `True`.

C'est le même mécanisme que `m[m["no2"] > 40]` pour garder les dépassements. On peut écrire
la condition à l'envers avec `~`, qui veut dire « non » :

```python
m = m[~m["no2"].isna()]      # identique : « pas manquant »
```

Les trois écritures donnent **exactement** la même table. Le filtre a un avantage : il se
combine avec d'autres conditions.

```python
# NO2 présent ET capteur du quartier Gare
gare = m[m["no2"].notna() & (m["quartier"] == "Gare")]
```

`&` veut dire « et ». Les parenthèses autour de `m["quartier"] == "Gare"` sont obligatoires.

## 3. Attention à `dropna()` sans `subset`

```python
m.dropna()                   # retire les lignes avec un NaN dans N'IMPORTE QUELLE colonne
```

Dans `mesures.csv`, seule la colonne `no2` a des trous, donc le résultat est le même :
7 913 lignes. Mais sur un fichier où `pm10` ou `temp` ont aussi des trous, `dropna()` retire
**beaucoup plus** de lignes que prévu. Précisez toujours `subset` : le code dit alors ce
qu'il fait.

## 4. Renuméroter les lignes : `reset_index`

Après le filtre, les lignes gardent leur numéro d'origine. La première ligne du fichier
(AQ-01, le 2 mars à minuit) avait un NO2 manquant : la table commence donc à **1**, pas à 0.

```python
m.index[:3]                  # [1, 2, 3]
m = m.reset_index(drop=True)
m.index[:3]                  # [0, 1, 2]
```

`drop=True` jette l'ancien numéro au lieu d'en faire une colonne. Ce n'est pas obligatoire
pour calculer, mais c'est plus lisible à l'affichage, et ça évite les surprises avec
`m.loc[0]`.

## 5. Vérifier : compter avant et après

Comme à l'étape 2 du TP 4b, on chiffre ce qu'on retire :

```python
avant = len(m)
m = m.dropna(subset=["no2"]).reset_index(drop=True)
print(f"{avant - len(m)} lignes retirées, {len(m)} restantes")
# 151 lignes retirées, 7913 restantes
```

---

## Retirer, ou combler ?

Retirer les lignes n'est pas toujours le bon choix.

**Pour une moyenne, inutile de retirer quoi que ce soit.** pandas ignore déjà les `NaN` :

```python
m["no2"].mean()              # 22.94, avec ou sans les lignes manquantes
m["no2"].count()             # 7913 : count ne compte que les valeurs présentes
```

**Retirer casse la régularité des heures.** Chaque capteur a une mesure par heure, 672 en
tout. Après `dropna`, AQ-01 n'en a plus que 658 : il manque des heures dans la série. C'est
gênant dès que l'ordre ou l'écart entre les mesures compte, par exemple pour un profil
heure par heure, une moyenne glissante ou une analyse de fréquence. Dans ce cas, on **comble**
les trous, comme à l'étape 2 du TP 4b ([`interpoler-par-capteur.md`](interpoler-par-capteur.md)).

**Retirer convient** quand chaque ligne est analysée seule, et qu'une ligne sans NO2 n'apporte
rien : un graphique de nuage de points NO2 / température, un export des mesures valides, un
calcul où un `NaN` ferait planter la suite.

| Besoin | Que faire |
|---|---|
| Une moyenne, un maximum, un `groupby` | Rien : pandas ignore les `NaN` |
| Une série régulière, heure par heure | Combler : `interpolate()` par capteur |
| Seulement les mesures réellement reçues | Retirer : `dropna(subset=["no2"])` |

Dans tous les cas, **écrivez le nombre de lignes retirées ou comblées** dans votre livrable :
c'est une décision sur les données, elle doit se voir.

---

## À retenir

| Écriture | Effet |
|---|---|
| `m.dropna(subset=["no2"])` | Retire les lignes où le NO2 manque |
| `m[m["no2"].notna()]` | Pareil, sous forme de filtre combinable |
| `m.dropna()` | Retire les lignes avec un trou **n'importe où** : à éviter sans `subset` |
| `.reset_index(drop=True)` | Renumérote les lignes à partir de 0 |
| `m["no2"].isna().sum()` | Compte les valeurs manquantes |
