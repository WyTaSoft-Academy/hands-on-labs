# TP 3b — Jupyter et formats

**Durée :** ≈ 30 min, dont 5 de restitution · **Module 3**, en fin d'après-midi · individuel

On ouvre enfin `mesures.csv` dans un notebook qui tourne sur l'environnement `aircite`
du TP 3a, et on compare ce que chaque format de fichier garde ou perd.

## Les fichiers

| Fichier | Contenu |
|---|---|
| `depart-3b.ipynb` | Le notebook à compléter |
| `corrige-3b.ipynb` | Le corrigé exécuté, projeté en restitution |
| `../tp3a-environnement/verifier_env.py` | Le test de l'environnement, lancé depuis le notebook |
| `../donnees/mesures.csv` | La copie de référence, si votre TP 2b n'a pas abouti |

## 1. Ouvrir JupyterLab sur le bon noyau

Dans l'environnement `aircite` activé, depuis le dossier `tp/` : `jupyter lab`.
Ouvrez `tp3b-jupyter-formats/depart-3b.ipynb` et choisissez le noyau **Python (aircite)**
(en haut à droite). Première cellule : `%run ../tp3a-environnement/verifier_env.py`.
L'interpréteur affiché doit être celui de `aircite` ; sinon, le notebook tourne ailleurs.

## 2. Un en-tête en Markdown

Remplacez la première cellule par votre propre en-tête : touche `M` pour passer la cellule
en Markdown, un titre `#`, la source des données, les unités (µg/m³, °C), le noyau.
`Maj+Entrée` pour l'afficher.

## 3. IPython : se documenter et mesurer

- `pd.read_csv?` : la documentation, sans quitter le notebook.
- `%timeit sum(range(100_000))`, puis `%timeit np.arange(100_000).sum()` : combien de fois plus rapide ?

> Repère, sur le poste de préparation : ≈ 2,4 à 2,8 ms contre ≈ 60 à 72 µs selon les passages,
> un facteur de 30 à 45.
> Vos chiffres seront différents, l'ordre de grandeur non.

## 4. Lire `mesures.csv`

Votre fichier du TP 2b (`../tp2b-logs-sqlite-csv/mesures.csv`), ou `../donnees/mesures.csv`.

1. Sans option : `shape` et `dtypes`. De quel type est `horodatage` ?
2. Avec `parse_dates=["horodatage"]` : et maintenant ?

> Vérification : `(8064, 6)` ; `horodatage` est `object` (du texte) sans option,
> `datetime64[ns]` avec.

## 5. Trois autres formats

Écrivez le DataFrame lu avec `parse_dates` en Parquet (`to_parquet`), en Excel
(`to_excel(..., index=False)`) et en JSON (`to_json(..., orient="records", lines=True)`).
Relisez chacun sans option, et dressez un petit tableau : taille du fichier, type de
`horodatage` à la relecture, nombre de NO2 manquants.

> Vérification, mesurée sur le poste de préparation :
>
> | Format | Taille | `horodatage` relu | NO2 manquants |
> |---|---|---|---|
> | CSV | 382 Ko | `object` (texte) | 151 |
> | Parquet | 42 Ko | `datetime64[ns]` | 151 |
> | Excel | 246 Ko | `datetime64[ns]` | 151 |
> | JSON (lignes) | 808 Ko | `int64` (millisecondes depuis 1970) | 151 |

## 6. Avant de partager

1. Menu **Kernel → Restart Kernel and Run All Cells** : le notebook doit passer de haut en
   bas, sans erreur, sur un noyau neuf.
2. Dans un terminal, depuis ce dossier : `jupyter nbconvert --to html depart-3b.ipynb`.
   Ouvrez le HTML produit dans un navigateur : c'est ce qu'on envoie à qui n'a pas Python.

## Bonus

L'arborescence de projet vue en séquence 4 (`data/raw`, `data/processed`, `notebooks`,
`src/aircite`, `reports/figures`), avec un `README.md`, votre `environment.yml` ou
`requirements.txt`, et un dépôt Git (`git init`) dont le `.gitignore` exclut `data/` et
`.venv/`.
