# TP 2b — Du journal des capteurs à `mesures.csv`

**Durée :** ≈ 50 min, dont 5 de restitution · **Module 2**, en fin de matinée · individuel

Le TP 2a a lu un extrait du journal avec `split()`. Ici, le journal entier, une regex
pour reconnaître les mesures, et la base pour y ajouter le quartier.

Les capteurs Air'Cité écrivent un journal texte, une ligne par événement. Le module 4
a besoin d'un tableau propre. Ce TP fait le pont : une base SQLite, une expression
régulière, et un fichier CSV dont on sait exactement ce qu'il a écarté.

## Les fichiers

| Fichier | Contenu |
|---|---|
| `capteurs.db` | Base SQLite, table `capteurs(id, nom, quartier, lat, lon, mise_en_service)` |
| `journal-capteurs.log` | Le journal brut des quatre semaines, en UTF-8 |
| `depart.py` | Le squelette à compléter |

Lancez vos scripts **depuis ce dossier** : les chemins sont relatifs.

## Ce que contient le journal

```
2026-03-02T00:00:00 INFO  AQ-01 no2= pm10=12.1 temp=5.5
2026-03-02T00:00:00 INFO  AQ-02 no2=25.6 pm10=15.9 temp=5.4
2026-03-02T00:00:00 ERROR AQ-07 redémarrage
2026-03-02T03:00:00 INFO  AQ-01 no2=21.
2026-03-02T03:00:00 INFO  AQ-01 no2=21.4 pm10=15.6 temp=4.4
2026-03-02T09:00:00 WARN  AQ-11 batterie faible (18 %)
```

Quatre sortes de lignes : une **mesure** (`INFO`), parfois avec une valeur manquante
(`no2=` vide) ; une **erreur** du capteur (`ERROR`) ; une **alerte** (`WARN`) ; une ligne
**tronquée** pendant l'envoi, que le capteur réémet aussitôt en entier.

## Étapes

### 1. Interroger la base

Connectez-vous à `capteurs.db`. Affichez le nombre de capteurs par quartier
(`GROUP BY`), puis construisez le dictionnaire `quartier_de` : identifiant → quartier.

> Vérification : 4 quartiers, 3 capteurs chacun ; `quartier_de["AQ-10"]` vaut `'Université'`.

### 2. Écrire la regex

Écrivez un motif qui reconnaît une ligne de mesure et en extrait, par **groupes nommés**,
`horodatage`, `capteur`, `no2`, `pm10`, `temp`. Testez-le d'abord sur les six lignes
ci-dessus, copiées dans une liste : déboguer une regex sur 8 000 lignes est pénible.

> Vérification : sur les six lignes, 3 correspondent ; la ligne `no2=` vide correspond, avec `no2 == ""`.

### 3. Écrire `mesures.csv`

Parcourez le journal ligne à ligne. Pour chaque mesure reconnue, écrivez une ligne
`horodatage,capteur,quartier,no2,pm10,temp` avec le module `csv` (`newline=""`,
`encoding="utf-8"`). Une valeur manquante reste une **cellule vide**. Triez les lignes par
capteur puis par horodatage avant de les écrire : le fichier devient comparable à celui
présenté en restitution.

### 4. Compter les rejets, par cause

Chaque ligne non écrite est comptée dans un `Counter`, par cause : `ERROR`, `WARN`,
ligne illisible, **capteur inconnu de la base**. Le journal contient un capteur qui n'est
pas dans `capteurs.db` : `quartier_de[...]` lève alors une `KeyError`. Deux réponses
acceptables : `quartier_de.get(id)` et un comptage à part, ou `try` / `except KeyError`
qui **compte** la ligne. La mauvaise : un `except` qui l'avale sans rien dire.

> Vérification : mesures écrites + rejets = nombre de lignes du journal.

## Résultats attendus

```
Lignes du journal : 8247
Mesures écrites   : 8064
Rejets            : {'ERROR': 66, 'illisible': 29, 'WARN': 58, 'capteur inconnu': 30}
NO2 manquants     : 151 (cellules vides)
```

Votre `mesures.csv` doit être identique à `../donnees/mesures.csv`. Sous Windows :
`fc mesures.csv ..\donnees\mesures.csv` ; ailleurs : `cmp mesures.csv ../donnees/mesures.csv`.

## Bonus

Reprenez la classe `Capteur` du TP 2a, qui accumule ses mesures de NO2, et ajoutez-lui
le compte de ses heures au-dessus de 60 µg/m³. Écrivez la liste des capteurs en alerte,
triée du plus au moins exposé, dans `alertes.txt`, et chaque heure en dépassement dans une table `alertes` de la base.

> Vérification : 6 capteurs en alerte, AQ-03 en tête avec 28 heures ; 82 lignes dans la table.

## Si vous êtes bloqué

`mesures.csv` est indispensable au module 4. Si votre script n'aboutit pas avant le
déjeuner, copiez `../donnees/mesures.csv` : c'est le même fichier.
