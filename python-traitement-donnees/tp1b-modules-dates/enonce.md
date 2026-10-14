# TP 1b — Un module à soi, et les dates

**Durée :** ≈ 50 min, dont 5 min de restitution · **Module 1**, en fin de journée · individuel

Deux parties **indépendantes** : bloqué sur l'import, passez aux dates et revenez-y.

## Les fichiers

| Fichier | Contenu |
|---|---|
| `depart.py` | Les fonctions de date à compléter, et des vérifications `OK` / `ÉCHEC` |
| `horodatages-aq03.txt` | Les horodatages reçus du capteur AQ-03 pendant la première semaine |

Lancez vos scripts **depuis ce dossier** : `import outils` ne trouve le fichier que s'il est
dans le dossier courant.

## 1. Un module à soi

Créez `outils.py` dans ce dossier et copiez-y vos fonctions du TP 1a, au moins
`plus_longue_serie` et `compter_niveaux` (pas fini le TP 1a ? Demandez-les au formateur).

Ajoutez à la fin d'`outils.py` :

```python
if __name__ == "__main__":
    print("Test d'outils, lancé comme script")
    assert plus_longue_serie([38.7, 41.2, 45.0, 52.1, 39.0, 47.0, 48.3], 40) == 3
    print("OK")
```

`python outils.py` doit afficher le test et `OK`.

## 2. L'importer

Créez `analyse.py` dans le même dossier :

```python
from outils import plus_longue_serie
print(plus_longue_serie([41.0, 42.5, 39.9, 44.1], 40))
```

`python analyse.py` affiche `2`, **sans** le message de test d'`outils.py` : le bloc
`__main__` ne s'exécute que lorsque le fichier est lancé comme script.

## 3. Lire les horodatages

`horodatages-aq03.txt` contient une ligne par mesure reçue, par exemple `2026-03-02T14:00:00`.
Le capteur mesure **toutes les heures**, mais quelques mesures se sont perdues.

Complétez `lire_horodatages` dans `depart.py` : lisez le fichier et convertissez chaque ligne
en `datetime` avec `datetime.strptime(texte, "%Y-%m-%dT%H:%M:%S")`.

## 4. Compter et chercher

1. Comptez les mesures par **jour de la semaine** (`.weekday()` : 0 = lundi ; un `Counter`
   ou un dictionnaire).
2. `heures_manquantes` : construisez l'ensemble des heures attendues, de la première à la
   dernière par pas de `timedelta(hours=1)`, puis retirez l'ensemble des heures présentes.
3. Affichez-les lisiblement : `f"{h:%d/%m à %Hh}"`.

> Vérification : 162 horodatages, du 02/03 00:00 au 08/03 23:00 ; lundi 23, mardi 21,
> mercredi à vendredi 24, samedi 22, dimanche 24 ; 6 heures manquantes, dont 3 le mardi 3 mars.

## Bonus

Combien de jours et d'heures séparent la première et la dernière mesure ? La soustraction de
deux `datetime` donne un `timedelta`.

> Vérification : `6 days, 23:00:00`.
