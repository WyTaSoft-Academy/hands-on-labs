# Python, initiation au traitement de données — travaux pratiques

Neuf TP, **deux par module** (trois au module 4), sur un seul jeu de données : **Air'Cité**,
un réseau **fictif** de 12 capteurs de qualité de l'air répartis dans 4 quartiers, qui
mesurent chaque heure pendant quatre semaines (2 au 29 mars 2026).

Chaque dossier contient un **énoncé** et un **point de départ** à compléter. Les corrigés
sont présentés en restitution, à la fin de chaque TP.

## Le fil

```
TP 1a  algorithmique                          journal-capteurs.log (niveaux)
TP 1b  un module à soi, les dates             horodatages-aq03.txt
TP 2a  une classe Capteur, un fichier         extrait-journal.log  →  resume.csv
TP 2b  capteurs.db + journal-capteurs.log  →  mesures.csv
TP 3a  l'environnement aircite, exporté, dupliqué, branché sur Jupyter
TP 3b  Jupyter et formats                     mesures.csv → Parquet, Excel, JSON
TP 4a  une image avec NumPy
TP 4b  statistiques et tracés                 mesures.csv → profil, semaine ; bonus SQL avec DuckDB
TP 4c  carte et spectre                       mesures.csv → carte, spectre
```

| Dossier | Module | Contenu |
|---|---|---|
| [`tp1a-algorithmique/`](tp1a-algorithmique/enonce.md) | 1 | `enonce.md`, `depart.py` (vérifications OK / ÉCHEC) |
| [`tp1b-modules-dates/`](tp1b-modules-dates/enonce.md) | 1 | `enonce.md`, `depart.py`, `horodatages-aq03.txt` |
| [`tp2a-classes-fichiers/`](tp2a-classes-fichiers/enonce.md) | 2 | `enonce.md`, `depart.py`, `extrait-journal.log` (les 120 premières lignes du journal) |
| [`tp2b-logs-sqlite-csv/`](tp2b-logs-sqlite-csv/enonce.md) | 2 | `enonce.md`, `depart.py`, `capteurs.db`, `journal-capteurs.log` |
| [`tp3a-environnement/`](tp3a-environnement/enonce.md) | 3 | `enonce.md`, `environment.yml`, `requirements.txt`, `verifier_env.py` |
| [`tp3b-jupyter-formats/`](tp3b-jupyter-formats/enonce.md) | 3 | `enonce.md`, `depart-3b.ipynb` |
| [`tp4-scipy-stack/`](tp4-scipy-stack/) | 4 | `enonce-4a/4b/4c.md`, `depart-4a/4b/4c.ipynb` |
| [`support/`](support/) | — | Le support de cours en PDF |
| `donnees/` | — | Les fichiers de référence et leur générateur |

## Les données

| Fichier | Contenu |
|---|---|
| `donnees/capteurs.db` | SQLite, table `capteurs(id, nom, quartier, lat, lon, mise_en_service)` : AQ-01 à AQ-12 |
| `donnees/journal-capteurs.log` | 8 247 lignes : 8 064 mesures, 66 `ERROR`, 58 `WARN`, 29 lignes tronquées (réémises aussitôt), 30 lignes d'un capteur de test AQ-13 absent de la base |
| `donnees/mesures.csv` | Le fichier que produit le TP 2b : 8 064 lignes, 151 NO2 manquants (cellules vides). Les TP 3b et 4 partent de lui |

Rien à générer : les fichiers sont fournis. `python donnees/generer_donnees.py` les
recrée à l'identique (tirage déterministe ; demande NumPy et pandas).

## Installer le poste

Anaconda (ou Miniforge) suffit pour les TP des modules 1, 2 et 4. Le TP 3a crée
l'environnement dédié `aircite` :

```
conda env create -f tp3a-environnement/environment.yml        voie conda
python -m pip install -r tp3a-environnement/requirements.txt  voie venv
python tp3a-environnement/verifier_env.py
```

**pandas est contraint à `>=2.2,<3`** : la formation a été préparée sous pandas 2.3,
et un `pip install pandas` sans contrainte installe aujourd'hui pandas 3.

## Lancer les scripts

Depuis le dossier du TP : les chemins sont relatifs (`python depart.py`,
`../donnees/mesures.csv`).
