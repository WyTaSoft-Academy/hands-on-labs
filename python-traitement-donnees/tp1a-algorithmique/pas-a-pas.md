# TP 1a — Pas à pas, pour ne pas rester bloqué

Ce guide suit l'[énoncé](enonce.md) étape par étape. Pour chaque fonction : la **méthode**,
puis un **squelette à trous** (`___`). Cherchez d'abord avec la méthode ; si ça ne vient
pas, complétez les trous.

Relancez `python depart.py` **après chaque fonction** : les lignes `obtenu` / `attendu`
montrent ce qui ne va pas. Bloqué plus de 5 minutes ? Passez à la suivante, elles sont
indépendantes.

---

## Étape 1 : l'environnement (5 min)

1. Ouvrez l'**Anaconda Prompt** et tapez `python --version` : il faut Python 3.11 ou plus.
2. Placez-vous dans le dossier du TP : `cd chemin\vers\tp1a-algorithmique`.
3. Lancez `python depart.py` : toutes les lignes affichent `ÉCHEC`, c'est normal.

**Blocages fréquents**

- *`python` n'est pas reconnu* : vous n'êtes pas dans l'Anaconda Prompt. Appelez le formateur.
- *`FileNotFoundError: ../donnees/journal-capteurs.log`* : le script n'est pas lancé depuis
  le dossier `tp1a-algorithmique`. Faites `cd` dans ce dossier avant de le lancer.

---

## Étape 2a : `fizzbuzz(n)`

**Méthode**

1. Créez une liste vide.
2. Parcourez `i` de 1 à `n` inclus, avec `range(1, n + 1)`.
3. Testez **d'abord** le cas « multiple de 3 et de 5 », sinon on ne l'atteint jamais.
4. Ajoutez le nombre **en texte** (`str(i)`) quand ce n'est ni Fizz ni Buzz.

```python
def fizzbuzz(n):
    resultat = []
    for i in range(1, ___):
        if i % 15 == 0:
            resultat.append(___)
        elif i % 3 == 0:
            resultat.append("Fizz")
        elif ___:
            resultat.append("Buzz")
        else:
            resultat.append(___)
    return resultat
```

**Pièges**

- `range(1, n)` s'arrête à `n - 1`.
- Ajouter `i` au lieu de `str(i)` : la vérification attend `"13"`, pas `13`.

---

## Étape 2b : `est_premier(n)`

**Méthode**

1. Si `n < 2`, ce n'est pas un nombre premier.
2. Partez de `d = 2` et avancez **tant que** `d * d <= n`.
3. Si `n % d == 0`, vous avez trouvé un diviseur : rendez `False`.
4. Si la boucle se termine sans diviseur, rendez `True`.

```python
def est_premier(n):
    if n < 2:
        return ___
    d = 2
    while d * d <= n:
        if n % d == 0:
            return ___
        d = d + 1          # sans cette ligne : boucle infinie
    return ___
```

**Piège** : sans `d = d + 1`, le programme ne rend jamais la main. Arrêtez-le avec `Ctrl+C`.

---

## Étape 2c : `premiers_jusqua(n)`

**Méthode** : une compréhension de liste qui garde les `x` de `range(n)` pour lesquels
`est_premier(x)` est vrai.

```python
def premiers_jusqua(n):
    return [x for x in range(___) if ___]
```

Si `est_premier` gère bien `n < 2`, il n'y a rien d'autre à exclure.

---

## Étape 3 : `plus_longue_serie(valeurs, seuil)`

**Méthode** : deux compteurs.

- `en_cours` : la longueur de la série en train de se former.
- `meilleure` : le record vu jusqu'ici.

Pour chaque valeur : si elle est **strictement** au-dessus du seuil, `en_cours` augmente
de 1 et on met à jour le record ; sinon, `en_cours` repart à 0.

**Déroulez l'exemple à la main** avant de coder, avec le seuil 40 :

| valeur | 38.7 | 41.2 | 45.0 | 52.1 | 39.0 | 47.0 | 48.3 |
|---|---|---|---|---|---|---|---|
| en_cours | 0 | 1 | 2 | 3 | 0 | 1 | 2 |
| meilleure | 0 | 1 | 2 | **3** | 3 | 3 | 3 |

```python
def plus_longue_serie(valeurs, seuil):
    en_cours = 0
    meilleure = 0
    for v in valeurs:
        if v > seuil:
            en_cours = ___
            meilleure = max(___, ___)
        else:
            en_cours = ___
    return meilleure
```

**Piège** : mettre à jour `meilleure` seulement dans le `else`. Si la série la plus longue
est la dernière, on la rate.

---

## Étape 4 : `compter_niveaux(lignes)`

**Méthode**

1. Partez d'un dictionnaire vide.
2. Pour chaque ligne, `ligne.split()` découpe sur les espaces, et `[1]` donne le
   **deuxième** mot.
3. `compteur.get(niveau, 0)` vaut 0 la première fois, puis le compte déjà fait : ajoutez-y 1.

```python
def compter_niveaux(lignes):
    compteur = {}
    for ligne in lignes:
        niveau = ligne.split()[___]
        compteur[niveau] = compteur.get(niveau, ___) + 1
    return compteur
```

Les vérifications de `depart.py` appliquent déjà la fonction au vrai journal. Pour
l'essayer à la main :

```python
with open("../donnees/journal-capteurs.log", encoding="utf-8") as f:
    print(compter_niveaux(f))
```

**Pièges**

- `[0]` au lieu de `[1]` : vous comptez des horodatages.
- `IndexError` : une ligne vide ou d'un seul mot. Si l'erreur apparaît, découpez d'abord
  (`mots = ligne.split()`) et vérifiez `len(mots) >= 2` avant de lire `mots[1]`.

### Le niveau `'I'`

Pour retrouver la ligne, numérotez-les avec `enumerate` :

```python
with open("../donnees/journal-capteurs.log", encoding="utf-8") as f:
    for numero, ligne in enumerate(f, start=1):
        if ligne.split()[1] == "I":
            print(numero, ligne)
```

Regardez aussi la ligne qui suit : que s'est-il passé ?

---

## Bonus : `moyenne_glissante(valeurs, k=3)`

**Méthode**

1. Une liste de 7 valeurs contient 5 fenêtres de 3 : `len(valeurs) - k + 1`.
2. La fenêtre qui commence à `i` est `valeurs[i:i + k]` (la fin est exclue).
3. Calculez la moyenne de chaque fenêtre, arrondie avec `round(…, 1)`.

```python
def moyenne_glissante(valeurs, k=3):
    resultat = []
    for i in range(len(valeurs) - k + 1):
        fenetre = valeurs[___:___]
        resultat.append(round(sum(fenetre) / ___, 1))
    return resultat
```

Contrôle sur la première fenêtre : (38.7 + 41.2 + 45.0) / 3 = 41.63…, arrondi à **41.6**.

---

Gardez votre fichier : le TP 1b réutilise `plus_longue_serie` et `compter_niveaux`.
