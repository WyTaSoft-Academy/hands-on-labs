# TP 4b, étape 2 — Interpoler capteur par capteur, pas à pas

Ce guide détaille l'étape 2 de l'[énoncé du TP 4b](enonce-4b.md) :

> Comptez avant, comblez, comptez après, et écrivez le nombre de valeurs remplacées.
> La ligne qui bloque le plus :
> `m["no2"] = m.groupby("capteur")["no2"].transform(lambda s: s.interpolate())`.
> Il reste un trou : lequel, et pourquoi ? `interpolate(limit_direction="both")` le comble.

Les chiffres sont ceux de `../donnees/mesures.csv`, lu avec
`pd.read_csv(..., parse_dates=["horodatage"])`.

---

## 1. Le problème : des trous dans le NO2

Certaines heures, un capteur n'a pas envoyé sa mesure de NO2. Dans le CSV, la cellule est
vide, et pandas la lit comme `NaN` (*Not a Number*), c'est-à-dire « valeur absente ».

```python
m["no2"].isna().sum()        # 151
```

`isna()` rend `True` pour chaque case vide, et `sum()` compte les `True`. Il y a donc
**151 trous** sur 8 064 lignes.

## 2. L'idée : interpoler

**Interpoler**, c'est deviner une valeur absente à partir de ses deux voisines, en traçant
une ligne droite entre elles. Exemple réel chez AQ-01 :

| horodatage | no2 |
|---|---|
| 03/03 06:00 | 34.2 |
| 03/03 07:00 | **NaN** |
| 03/03 08:00 | 61.2 |

`interpolate()` remplace le trou par le point au milieu : (34.2 + 61.2) / 2 = **47.7**.
C'est raisonnable pour une mesure horaire qui varie progressivement.

## 3. Pourquoi « capteur par capteur » ?

Le fichier est trié par capteur, puis par heure. Les 672 heures d'AQ-01 viennent d'abord,
puis celles d'AQ-02, et ainsi de suite. Si on interpole toute la colonne d'un coup, la ligne
droite **traverse la frontière entre deux capteurs**.

C'est ce qui arrive réellement en fin d'AQ-10 : ses deux dernières heures sont vides, et le
capteur suivant, AQ-11, commence à 8.7.

| | AQ-10, 29/03 22:00 | AQ-10, 29/03 23:00 |
|---|---|---|
| Sans `groupby` (`m["no2"].interpolate()`) | 9.23 | 8.97 |
| Capteur par capteur | 9.5 | 9.5 |

Sans `groupby`, AQ-10 reçoit des valeurs calculées avec une mesure d'**AQ-11**, un autre
capteur, dans un autre quartier. C'est faux. D'où le `groupby("capteur")`.

## 4. La ligne qui bloque, morceau par morceau

```python
m["no2"] = m.groupby("capteur")["no2"].transform(lambda s: s.interpolate())
```

Elle se lit **de l'intérieur vers l'extérieur** :

| Morceau | Ce qu'il fait |
|---|---|
| `m.groupby("capteur")` | Range les lignes en 12 paquets, un par capteur |
| `["no2"]` | Dans chaque paquet, ne garde que la colonne NO2 |
| `lambda s: s.interpolate()` | Une petite fonction sans nom : « reçois une série `s`, rends-la interpolée » |
| `.transform(...)` | Applique cette fonction à chaque paquet, puis **recolle** les 12 résultats dans l'ordre d'origine |
| `m["no2"] = ...` | Remplace l'ancienne colonne par la colonne comblée |

**Pourquoi `transform`, et pas `mean()` ou `agg` ?** `mean()` rendrait **une valeur par
capteur**, soit 12 lignes. `transform` rend une série de **même longueur** que la table,
8 064 lignes, alignée ligne à ligne : on peut donc la remettre dans la colonne.

**Pourquoi une `lambda` ?** `transform` attend une fonction. On pourrait écrire la même chose
avec `def` :

```python
def combler(s):
    return s.interpolate()

m["no2"] = m.groupby("capteur")["no2"].transform(combler)
```

La `lambda` évite de nommer une fonction qui ne sert qu'une fois.

## 5. Compter avant, combler, compter après

```python
avant = m["no2"].isna().sum()
m["no2"] = m.groupby("capteur")["no2"].transform(lambda s: s.interpolate())
apres = m["no2"].isna().sum()
print(f"{avant} trous, {avant - apres} comblés, {apres} restant(s)")
```

Résultat :

```
151 trous, 150 comblés, 1 restant(s)
```

On compte pour **prouver** ce que le traitement a fait. Un nettoyage de données qu'on ne
chiffre pas ne se vérifie pas.

## 6. Le trou qui reste : lequel, et pourquoi ?

Pour le trouver, on filtre les lignes encore vides :

```python
print(m[m["no2"].isna()][["horodatage", "capteur"]])
```

```
  horodatage capteur
0 2026-03-02   AQ-01
```

C'est la **toute première heure d'AQ-01**, le 2 mars à minuit, la première ligne du fichier.

**Pourquoi il reste vide :** par défaut, `interpolate()` travaille **vers l'avant**. Elle
comble un trou à partir de la valeur qui le **précède**. Ce trou-là n'a aucune valeur avant
lui, puisque c'est la première mesure du capteur. Il n'y a pas de ligne droite à tracer.

À l'inverse, les deux trous de fin d'AQ-10 ont bien été comblés : ils ont une valeur avant
eux (9.5), et pandas la prolonge.

## 7. `limit_direction="both"` le comble

```python
m["no2"] = m.groupby("capteur")["no2"].transform(
    lambda s: s.interpolate(limit_direction="both"))
```

`limit_direction="both"` autorise à combler aussi **vers l'arrière**. Pour un trou en tête,
pandas recopie la première valeur connue : la case d'AQ-01 à minuit prend la valeur de 1 h,
**11.3**.

```python
m["no2"].isna().sum()        # 0
```

Il n'y a plus aucun trou.

---

## À retenir

- **`groupby` + `transform`** : appliquer un traitement groupe par groupe, et garder une
  colonne de même longueur.
- **Interpoler à travers les groupes** mélange des données qui n'ont rien à voir. Ici, AQ-11
  contaminait AQ-10.
- **Une interpolation ne comble pas un trou en tête** de série. `limit_direction="both"` le
  fait, mais en **recopiant** une valeur voisine : c'est une hypothèse, pas une mesure. On la
  signale dans le livrable, avec le nombre de valeurs remplacées.
