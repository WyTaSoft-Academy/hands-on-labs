# TP 2a — Une classe et un fichier

**Durée :** ≈ 25 min, dont 5 de restitution · **Module 2**, après la séquence 2 · individuel

Avant la regex et la base de données du TP 2b, un premier contact avec le journal :
on le lit ligne à ligne, on range les mesures de NO2 dans un objet par capteur, et
on écrit un petit résumé en CSV. L'extrait est déjà un CSV : pas de regex, le module
`csv` le découpe pour vous.

## Les fichiers

| Fichier | Contenu |
|---|---|
| `extrait-journal.csv` | Les 120 premières lignes du journal Air'Cité (le 2 mars, de 0 h à 9 h), en CSV : `horodatage,niveau,capteur,no2,pm10,temp,message` |
| `depart.py` | La classe et les fonctions à compléter, et des vérifications `OK` / `ÉCHEC` |
| `corrige.py` | Le corrigé, projeté en restitution |

Lancez vos scripts **depuis ce dossier** : `python depart.py`.

## Étapes

1. **La classe `Capteur`.** `__init__(self, id)` crée l'identifiant, une liste `mesures`
   **propre à chaque instance**, et un compteur `manquantes`. `ajouter(texte)` convertit
   `"41.2"` en `float` et l'ajoute, ou compte une valeur manquante si `texte` est vide.
   `moyenne()` rend `None` s'il n'y a aucune mesure. `__repr__` affiche
   `Capteur('AQ-01', 9 mesures)`.
2. **Lire le journal.** `lire(chemin)` ouvre le fichier avec `encoding="utf-8"` et
   `newline=""`, et le parcourt avec `csv.reader` : chaque ligne arrive déjà découpée, en
   liste de champs. `next(lecteur)` passe la ligne d'en-tête. Gardez les lignes de
   **7 champs** dont le niveau est `INFO`, et écartez (en les comptant) toutes les autres.
   Le NO2 est dans le 4ᵉ champ, `champs[3]` : `"41.2"`, ou `""` si la mesure manque.
3. **Écrire le résumé.** `ecrire_resume(capteurs, chemin)` écrit `resume.csv` avec le module
   `csv` (`newline=""`, `encoding="utf-8"`) : `capteur,mesures,manquantes,no2_moyen,no2_max`,
   un capteur par ligne, triés par identifiant.

## Résultats attendus

```
12 capteurs, 4 lignes écartées
Capteur('AQ-01', 9 mesures)   manquantes : 1
Moyenne d'AQ-03 : 34.1
capteur,mesures,manquantes,no2_moyen,no2_max
AQ-01,9,1,30.5,55.8
```

Les 4 lignes écartées : trois erreurs de capteur (`ERROR`) et une ligne tronquée.
Regardez-la : `csv.reader` la découpe en 4 champs, pas 7. La ligne d'en-tête, elle,
n'est pas une ligne écartée : `next` l'a passée avant la boucle.

## Bonus

- `__lt__(self, autre)` compare deux capteurs par leur moyenne : `sorted(capteurs.values(),
  reverse=True)` donne alors les plus exposés en tête (AQ-03, AQ-02, AQ-04).
- Pourquoi la liste `mesures` doit-elle être créée dans `__init__`, et pas sous `class Capteur:` ?
  Essayez, et regardez `len(b.mesures)` dans la première vérification.

Cette classe resservira au bonus du TP 2b, sur le journal entier.
