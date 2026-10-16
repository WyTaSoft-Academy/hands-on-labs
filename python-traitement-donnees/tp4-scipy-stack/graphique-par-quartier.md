# TP 4b, après le bonus 1 — Un graphique par quartier

Le bonus 1 range les moyennes journalières dans un classeur Excel, un onglet par quartier
(voir [`journalier-excel.md`](journalier-excel.md)). Ce guide fait la même chose **en
graphiques** : les quatre quartiers sur une seule feuille, ou un fichier image par quartier.

On part de deux objets du bonus 1 :

- `jour` : le tableau des moyennes journalières, 28 jours × 12 capteurs ;
- `cap` : la table des capteurs, lue avec `pd.read_sql`, pour savoir quel capteur est dans
  quel quartier.

```python
jour = (m.set_index("horodatage").groupby("capteur")["no2"]
          .resample("D").mean().round(1).unstack("capteur"))
```

Les résultats décrits ci-dessous ont été obtenus en exécutant le code sur
`../donnees/mesures.csv`, après l'interpolation de l'étape 2.

---

## 1. Les quatre quartiers sur une seule feuille

```python
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

fig, axes = plt.subplots(2, 2, figsize=(12, 7), sharex=True, sharey=True)
for ax, (q, ids) in zip(axes.flat, cap.groupby("quartier")["id"]):
    jour[ids.tolist()].plot(ax=ax, x_compat=True)
    ax.set_title(q)
    ax.axhline(40, color="red", linestyle="--", linewidth=1, label="seuil")
    ax.set_xlabel("")
    ax.set_ylabel("NO2 (µg/m³)")
    ax.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday=mdates.MO))
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%d/%m"))
    ax.grid(alpha=.3)
    ax.legend(title="capteur", fontsize=8)
fig.suptitle("Air'Cité : NO2 moyen journalier, par quartier")
fig.tight_layout()
fig.savefig("quartiers.png", dpi=120, bbox_inches="tight")
```

Le résultat, `quartiers.png` : quatre graphiques en grille, Centre et Gare en haut, Port et
Université en bas. Chacun montre ses trois capteurs, et le seuil de 40 µg/m³ en pointillés
rouges.

### Ligne par ligne

**`fig, axes = plt.subplots(2, 2, figsize=(12, 7), sharex=True, sharey=True)`**

- `subplots(2, 2)` crée une feuille avec **4 graphiques**, sur 2 lignes et 2 colonnes.
  Avec un seul graphique, on écrivait `fig, ax = …` ; ici, `axes` (au pluriel) est un
  **tableau 2 × 2** de graphiques : `axes[0, 0]` en haut à gauche, `axes[1, 1]` en bas à droite.
- `figsize=(12, 7)` : une feuille plus grande, en pouces, pour loger les quatre.
- `sharex=True, sharey=True` : les quatre graphiques partagent **les mêmes échelles**. C'est
  indispensable pour comparer : sans `sharey`, l'Université (autour de 13) aurait un axe
  vertical de 10 à 17, et ses courbes paraîtraient aussi hautes que celles du Centre.

**`for ax, (q, ids) in zip(axes.flat, cap.groupby("quartier")["id"]):`**

C'est la ligne la plus dense. Elle fait avancer **deux choses en même temps** : les
graphiques et les quartiers.

- `axes.flat` aligne les 4 graphiques du tableau 2 × 2 en une **file** : haut gauche, haut
  droite, bas gauche, bas droite.
- `cap.groupby("quartier")["id"]` donne les 4 quartiers, dans l'ordre alphabétique, avec à
  chaque fois les identifiants de leurs capteurs.
- `zip(a, b)` les **apparie** : 1ᵉʳ graphique avec 1ᵉʳ quartier, 2ᵉ avec 2ᵉ, etc.
- À chaque tour, on récupère le graphique dans `ax`, et le couple (quartier, capteurs) dans
  `(q, ids)` : les parenthèses déballent ce couple en deux variables.

| Tour | `ax` | `q` | `ids.tolist()` |
|---|---|---|---|
| 1 | en haut à gauche | `Centre` | `['AQ-01', 'AQ-02', 'AQ-03']` |
| 2 | en haut à droite | `Gare` | `['AQ-04', 'AQ-05', 'AQ-06']` |
| 3 | en bas à gauche | `Port` | `['AQ-07', 'AQ-08', 'AQ-09']` |
| 4 | en bas à droite | `Université` | `['AQ-10', 'AQ-11', 'AQ-12']` |

**`jour[ids.tolist()].plot(ax=ax, x_compat=True)`**

- `jour[ids.tolist()]` : les colonnes des 3 capteurs du quartier, comme pour l'onglet Excel.
- `.plot(ax=ax)` : une courbe par capteur, **dans le graphique de ce tour**.
- `x_compat=True` : par défaut, pandas gère lui-même l'axe des dates, à sa façon, et ignore
  les réglages de Matplotlib. Cette option lui laisse la main, pour que les deux lignes
  `xaxis.set_major_…` ci-dessous fonctionnent.

**`ax.set_title(q)`** : le nom du quartier au-dessus de chaque graphique.

**`ax.axhline(40, color="red", linestyle="--", linewidth=1, label="seuil")`**

`axhline` trace une ligne **horizontale** sur toute la largeur, à la hauteur 40 : le seuil de
référence du NO2. `linestyle="--"` la dessine en pointillés, et `label="seuil"` la fait
apparaître dans la légende.

**`ax.set_xlabel("")`** : retire l'étiquette `horodatage` que pandas met sous l'axe
horizontal. Les dates parlent d'elles-mêmes, et la place est comptée sur quatre graphiques.

**`ax.set_ylabel("NO2 (µg/m³)")`** : l'unité, comme toujours.

**`ax.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday=mdates.MO))`**

- `ax.xaxis` : l'axe horizontal du graphique.
- Un *locator* décide **où** placer les graduations. `WeekdayLocator(byweekday=mdates.MO)`
  en met une **chaque lundi** (*Monday*).
- Sans cette ligne, pandas écrit une étiquette **par jour** : 28 dates qui se chevauchent et
  deviennent illisibles.

**`ax.xaxis.set_major_formatter(mdates.DateFormatter("%d/%m"))`**

Un *formatter* décide **comment** écrire chaque graduation. `"%d/%m"` donne le jour puis le
mois : `09/03`. Ce sont les mêmes codes qu'avec `strftime` au TP 1b.

**`ax.grid(alpha=.3)`** : une grille discrète.

**`ax.legend(title="capteur", fontsize=8)`** : la légende, redessinée pour inclure le seuil,
en petits caractères pour ne pas cacher les courbes.

**`fig.suptitle("…")`** (en dehors de la boucle) : un titre pour **toute la feuille**,
au-dessus des quatre titres de quartier. `suptitle` veut dire *super title*.

**`fig.tight_layout()`** : recalcule les espacements entre les graphiques, pour que les
titres, les étiquettes et les légendes ne se chevauchent pas.

**`fig.savefig("quartiers.png", dpi=120, bbox_inches="tight")`** : on enregistre la feuille
entière, comme pour le profil journalier (voir [`tracer-le-profil.md`](tracer-le-profil.md)).

### Ce que montre le graphique

- Des **creux réguliers tous les 7 jours** : les 7-8, 14-15, 21-22 et 28-29 mars. Ce sont les
  **week-ends** (le 2 mars 2026 est un lundi) : moins de trafic, moins de NO2. C'est ce que
  chiffre l'étape 5 du TP.
- **Aucune moyenne journalière n'atteint 40**, même dans le Centre. Les dépassements vus sur
  le profil journalier ont lieu aux **heures de pointe** : une moyenne sur 24 heures les lisse.
- Les quatre quartiers suivent le même rythme, à des niveaux différents : Centre et Gare
  autour de 30, Port autour de 20, Université autour de 13.

---

## 2. Variante : un fichier image par quartier

```python
for q, ids in cap.groupby("quartier")["id"]:
    fig, ax = plt.subplots(figsize=(9, 4))
    jour[ids.tolist()].plot(ax=ax, x_compat=True)
    ax.set_title(f"NO2 moyen journalier : {q}")
    ax.set_xlabel("")
    ax.set_ylabel("NO2 (µg/m³)")
    ax.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday=mdates.MO))
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%d/%m"))
    ax.xaxis.set_minor_locator(mdates.DayLocator())
    ax.grid(alpha=.3)
    fig.savefig(f"journalier-{q}.png", dpi=120, bbox_inches="tight")
    plt.close(fig)
```

**L'axe des dates.** Sans les trois lignes `ax.xaxis.set_…`, pandas écrit une étiquette par
jour : `02`, `03`, `04`… jusqu'à `29`, collées les unes aux autres, avec `Mar 2026` en dessous.
Avec elles :

- `set_major_locator(WeekdayLocator(byweekday=mdates.MO))` : une **étiquette** chaque lundi,
  soit 5 dates lisibles (`02/03`, `09/03`, `16/03`, `23/03`, `30/03`) ;
- `set_major_formatter(DateFormatter("%d/%m"))` : écrites jour/mois ;
- `set_minor_locator(DayLocator())` : un **petit trait** sans texte pour chaque jour, pour
  garder le repère quotidien sans encombrer l'axe.

`x_compat=True` est indispensable : sans lui, pandas garde la main sur l'axe des dates et
ignore ces trois réglages.

> **Encore trop serré ?** Penchez les étiquettes : `ax.tick_params(axis="x", labelrotation=45)`,
> ou élargissez la figure : `figsize=(12, 4)`. Pour écrire le jour de la semaine, `"%a %d/%m"`
> donne `Mon 09/03` : en anglais, car Python suit la langue par défaut du système.

On obtient 4 fichiers : `journalier-Centre.png`, `journalier-Gare.png`, `journalier-Port.png`
et `journalier-Université.png`.

Les différences avec la version sur une feuille :

- `plt.subplots(...)` est **dans** la boucle : une nouvelle figure à chaque quartier.
- Le nom du fichier est construit avec une **f-string** : `f"journalier-{q}.png"`.
- `plt.close(fig)` **ferme** chaque figure une fois enregistrée. Sans lui, un notebook
  afficherait les 4 graphiques à la suite, et Matplotlib garderait toutes les figures en
  mémoire (il prévient au-delà de 20).
- Pas de `sharey` ici : chaque image a sa propre échelle. Pratique pour lire un quartier
  seul, **trompeur** pour comparer les quartiers entre eux. Pour comparer, préférez la
  version sur une feuille, ou fixez l'échelle avec `ax.set_ylim(0, 45)`.

---

## À retenir

| Écriture | Effet |
|---|---|
| `fig, axes = plt.subplots(2, 2, sharex=True, sharey=True)` | 4 graphiques sur une feuille, avec les mêmes échelles |
| `zip(axes.flat, groupes)` | Avancer en même temps dans les graphiques et dans les groupes |
| `.plot(ax=ax, x_compat=True)` | Tracer dans un graphique précis, en laissant Matplotlib régler les dates |
| `ax.axhline(40, linestyle="--")` | Une ligne horizontale de référence |
| `mdates.WeekdayLocator(byweekday=mdates.MO)` | Une graduation par lundi |
| `mdates.DateFormatter("%d/%m")` | Les dates écrites `09/03` |
| `mdates.DayLocator()` en `set_minor_locator` | Un petit trait par jour, sans texte |
| `fig.suptitle(...)`, `fig.tight_layout()` | Un titre pour la feuille, des espacements recalculés |
| `plt.close(fig)` | Fermer une figure créée dans une boucle |
