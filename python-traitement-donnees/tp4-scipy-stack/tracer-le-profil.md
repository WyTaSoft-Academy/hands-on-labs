# TP 4b, étape 4 — Tracer le profil journalier, ligne par ligne

Ce guide explique le tracé de l'étape 4 de l'[énoncé du TP 4b](enonce-4b.md) :

```python
fig, ax = plt.subplots(figsize=(9, 4.5))
profil.plot(ax=ax)
ax.set_title("Air'Cité : profil journalier du NO2, quatre semaines")
ax.set_xlabel("heure")
ax.set_ylabel("NO2 (µg/m³)")
ax.set_xticks(range(0, 24, 2))
ax.grid(alpha=.3)
fig.savefig("profil.png", dpi=120, bbox_inches="tight")
```

Les chiffres sont ceux de `../donnees/mesures.csv`, après l'interpolation de l'étape 2.

---

## 0. Ce qu'on trace : le tableau `profil`

Juste avant le tracé, l'étape 4 construit le tableau `profil` :

```python
import matplotlib.pyplot as plt

m["heure"] = m["horodatage"].dt.hour
profil = m.pivot_table(index="heure", columns="quartier", values="no2", aggfunc="mean")
```

```
quartier  Centre  Gare  Port  Université
heure
0           20.5  20.7  14.4         8.4
1           20.0  20.1  15.5         9.8
2           19.7  19.7  14.5         9.5
...
```

- **24 lignes**, une par heure de la journée (de 0 à 23). C'est l'**index** du tableau.
- **4 colonnes**, une par quartier.
- Chaque case : le NO2 **moyen** de ce quartier à cette heure-là, sur les quatre semaines.

Le tracé va dessiner **une courbe par colonne** : quatre courbes, l'heure en abscisse.

---

## 1. Créer la figure et le graphique : `plt.subplots`

```python
fig, ax = plt.subplots(figsize=(9, 4.5))
```

Matplotlib distingue deux objets, qu'il faut bien séparer :

| Objet | Ce que c'est | Image |
|---|---|---|
| `fig` (*Figure*) | La **feuille** entière : ce qu'on enregistre dans un fichier | Le cadre du tableau |
| `ax` (*Axes*) | **Un** graphique sur cette feuille, avec ses axes, son titre, sa grille | La toile dans le cadre |

`plt.subplots()` crée les deux d'un coup et les rend **ensemble** : `fig, ax = ...` les range
dans deux variables (c'est un déballage de tuple, comme `a, b = 1, 2`).

`figsize=(9, 4.5)` donne la taille de la feuille **en pouces** : 9 de large, 4,5 de haut.
Deux fois plus large que haute, parce qu'on trace une journée de 24 heures : un format
allongé laisse respirer l'axe horizontal.

> **Pourquoi `subplots` au pluriel ?** La même fonction crée plusieurs graphiques sur une
> feuille : `plt.subplots(1, 2)` en place deux côte à côte. Sans argument, elle en crée un seul.

## 2. Dessiner les courbes : `profil.plot(ax=ax)`

```python
profil.plot(ax=ax)
```

- `.plot()` est une méthode **de pandas** : elle appelle Matplotlib pour vous.
- Pour un DataFrame, elle trace **une courbe par colonne**, avec l'**index** en abscisse.
  Ici : quatre courbes (Centre, Gare, Port, Université), les heures 0 à 23 en abscisse.
- Elle ajoute aussi, toute seule, une **légende** (titrée `quartier`, le nom des colonnes) et
  une étiquette d'axe horizontal (`heure`, le nom de l'index).
- Les couleurs sont attribuées automatiquement, dans l'ordre des colonnes.

`ax=ax` dit **où** dessiner : dans le graphique créé à l'étape 1.

> **Le piège :** sans `ax=ax`, pandas crée **sa propre** figure. Les lignes suivantes
> (`ax.set_title`…) modifient alors le graphique vide de l'étape 1, et `fig.savefig` enregistre
> une image **vide**, avec un titre mais sans courbe.

À ce stade, le graphique existe déjà :

- deux **pics** nets, à **8 h** et à **18 h** : les heures de pointe du trafic ;
- le Centre et la Gare presque confondus en haut (55,2 et 54,4 µg/m³ à 8 h) ;
- l'Université tout en bas (24,2 à 8 h) ;
- l'axe horizontal gradué tous les 5 (0, 5, 10, 15, 20), et aucun titre.

Les lignes suivantes le rendent lisible.

## 3. Le titre : `ax.set_title`

```python
ax.set_title("Air'Cité : profil journalier du NO2, quatre semaines")
```

Le titre s'affiche au-dessus du graphique. Un bon titre dit **quoi** (le NO2), **comment**
(un profil journalier, c'est-à-dire une moyenne heure par heure) et **sur quelle période**
(quatre semaines). Quelqu'un qui ne voit que l'image doit comprendre ce qu'elle montre.

> **Les guillemets :** le titre contient une apostrophe (`Air'Cité`). Il est donc écrit entre
> guillemets **doubles** `"…"`. Entre guillemets simples, l'apostrophe fermerait le texte trop
> tôt : `SyntaxError`.

## 4. Les étiquettes des axes : `set_xlabel`, `set_ylabel`

```python
ax.set_xlabel("heure")
ax.set_ylabel("NO2 (µg/m³)")
```

- `set_xlabel` : sous l'axe horizontal. pandas avait déjà écrit `heure` (le nom de l'index),
  mais le préciser rend le code indépendant de ce nom : si l'index s'appelait `h`, l'étiquette
  resterait juste.
- `set_ylabel` : le long de l'axe vertical. C'est l'étiquette la plus importante, car elle
  porte l'**unité** : des microgrammes par mètre cube. Un nombre sans unité ne se compare à
  rien, ni au seuil de 40, ni à une autre ville.

Les caractères `µ` et `³` s'écrivent directement dans le texte : Python et Matplotlib
gèrent l'Unicode.

## 5. Les graduations : `ax.set_xticks`

```python
ax.set_xticks(range(0, 24, 2))
```

Par défaut, Matplotlib a gradué tous les 5 (0, 5, 10, 15, 20) : des valeurs rondes pour lui,
mais pas pour une journée. On impose une graduation **toutes les 2 heures**.

`range(0, 24, 2)` produit 0, 2, 4, … , 22 :

| Argument | Rôle |
|---|---|
| `0` | Départ |
| `24` | Fin, **exclue** (comme pour le slicing) : 24 n'est pas produit |
| `2` | Le pas |

On lit maintenant directement les pics sur une graduation : 8 et 18.

## 6. La grille : `ax.grid`

```python
ax.grid(alpha=.3)
```

- `ax.grid()` ajoute un quadrillage, aligné sur les graduations : il aide l'œil à lire une
  valeur.
- `alpha` règle la **transparence**, de 0 (invisible) à 1 (opaque). `.3` est une écriture
  courte de `0.3` : une grille discrète, qui guide sans attirer l'œil plus que les courbes.

## 7. Enregistrer l'image : `fig.savefig`

```python
fig.savefig("profil.png", dpi=120, bbox_inches="tight")
```

- C'est la **figure** (`fig`) qu'on enregistre, pas le graphique (`ax`) : on enregistre
  toute la feuille.
- `"profil.png"` : le nom du fichier. L'extension choisit le format : `.png` pour une image,
  `.pdf` ou `.svg` pour un dessin vectoriel qui reste net à tout zoom. Le fichier est créé
  dans le **dossier courant**, celui du notebook.
- `dpi=120` (*dots per inch*, points par pouce) : la résolution. 9 pouces × 120 = 1 080
  pixels de large, 4,5 × 120 = 540 de haut. Plus de `dpi`, une image plus nette et plus lourde.
- `bbox_inches="tight"` **recadre** l'image au plus juste autour du contenu : il retire les
  marges blanches inutiles, et surtout évite qu'un titre ou une étiquette soit **coupé** au
  bord. Ici, l'image passe de 1 080 × 540 à environ 894 × 491 pixels.

> **Pourquoi `fig.savefig` et pas `plt.savefig` ?** `plt.savefig` enregistre la figure
> « courante », celle que Matplotlib considère comme active. Dans un script, `plt.show()`
> ferme la figure une fois sa fenêtre fermée : un `plt.savefig` placé après enregistre alors
> une image **blanche**. `fig.savefig` vise la figure par son nom, sans ambiguïté. Dans tous
> les cas, l'habitude la plus sûre est d'enregistrer **avant** d'afficher.

---

## Le résultat

`profil.png` montre quatre courbes de même forme : bas la nuit, un pic à 8 h, un creux en
milieu de journée, un second pic à 18 h. C'est la signature du trafic routier. Le Centre et
la Gare dépassent le seuil de 40 µg/m³ aux deux pointes ; l'Université reste partout sous 25.

---

## À retenir

| Ligne | Rôle |
|---|---|
| `fig, ax = plt.subplots(figsize=(9, 4.5))` | Créer la feuille (`fig`) et le graphique (`ax`), taille en pouces |
| `profil.plot(ax=ax)` | Une courbe par colonne, l'index en abscisse, **dans** `ax` |
| `ax.set_title(...)` | Le titre : quoi, comment, sur quelle période |
| `ax.set_xlabel(...)`, `ax.set_ylabel(...)` | Les étiquettes, avec l'**unité** |
| `ax.set_xticks(range(0, 24, 2))` | Une graduation toutes les 2 heures |
| `ax.grid(alpha=.3)` | Une grille discrète |
| `fig.savefig("profil.png", dpi=120, bbox_inches="tight")` | Enregistrer la feuille, sans marge ni texte coupé, de préférence avant `plt.show()` |

**La méthode générale :** `fig, ax = plt.subplots()`, on dessine dans `ax`, on règle `ax`
avec des méthodes `ax.set_…`, et on enregistre `fig`. Tous les graphiques du TP 4 suivent ce
schéma.
