# TP 1a — Algorithmique : des boucles, des tests, des fonctions

**Durée :** ≈ 40 min, dont 5 min de restitution · **Module 1**, après les fonctions · individuel

Quatre étapes. Bloqué sur une fonction, passez à la suivante et revenez-y.

## Les fichiers

| Fichier | Contenu |
|---|---|
| `depart.py` | Les fonctions à compléter, et des vérifications qui affichent `OK` ou `ÉCHEC` |
| `pas-a-pas.md` | La méthode et un squelette à trous pour chaque fonction, si vous êtes bloqué |
| `../donnees/journal-capteurs.log` | Le journal des capteurs Air'Cité, pour l'étape 4 |

Lancez vos scripts **depuis ce dossier** : `python depart.py`.

## 1. L'environnement (5 min, sur tous les postes)

1. Ouvrez l'**Anaconda Prompt** (ou un terminal où Python est installé) : `python --version`
   doit afficher Python 3.11 ou plus récent. Si la commande n'est pas reconnue, appelez le
   formateur **maintenant** : le module 3 en dépend.
2. Ouvrez `depart.py` dans **Spyder** (ou VS Code) et exécutez-le (`F5`). Toutes les
   vérifications sont en `ÉCHEC` : c'est normal, rien n'est écrit.
3. Relancez-le depuis le terminal : `python depart.py`. Même résultat.

## 2. FizzBuzz et nombres premiers

- `fizzbuzz(n)` rend la liste `"1"`, `"2"`, `"Fizz"`, `"4"`, `"Buzz"`… jusqu'à `n` :
  `Fizz` pour les multiples de 3, `Buzz` de 5, `FizzBuzz` des deux.
- `est_premier(n)` : cherchez un diviseur `d` à partir de 2, tant que `d * d <= n` (un `while`).
- `premiers_jusqua(n)` : une compréhension de liste qui utilise `est_premier`.

> Vérification : `fizzbuzz(15)[-1] == "FizzBuzz"` ; les premiers inférieurs à 30 sont
> `[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]`.

## 3. La plus longue série

`plus_longue_serie(valeurs, seuil)` : le plus grand nombre de relevés **consécutifs**
strictement au-dessus du seuil. Il faut deux compteurs : la série en cours, et la meilleure.

> Vérification : `3` pour la série `[38.7, 41.2, 45.0, 52.1, 39.0, 47.0, 48.3]` et le seuil 40.

## 4. Compter les niveaux du journal

`compter_niveaux(lignes)` rend un dictionnaire `{niveau: nombre}`, le niveau étant le
deuxième mot de chaque ligne (`split()`, puis `dict.get(cle, 0) + 1`).

> Vérification : `{'INFO': 3, 'ERROR': 2, 'WARN': 1}` pour six lignes de test.

Puis appliquez-la au vrai journal : un fichier ouvert avec
`open("../donnees/journal-capteurs.log", encoding="utf-8")` se parcourt ligne à ligne,
comme une liste.

> Vérification : `{'INFO': 8121, 'ERROR': 66, 'WARN': 58, 'I': 1}`. Le niveau `'I'` n'en est
> pas un : retrouvez la ligne (`enumerate`) et dites ce qui lui est arrivé. On traitera ces
> lignes au TP 2b.

## Bonus

`moyenne_glissante(valeurs, k=3)` : la moyenne de chaque fenêtre de 3 relevés consécutifs,
arrondie au dixième.

> Vérification : `[41.6, 46.1, 45.4, 46.0, 44.8]` pour la série de l'étape 3.

Gardez vos fonctions : le TP 1b les range dans un module.
