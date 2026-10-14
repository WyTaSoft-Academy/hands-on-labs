"""TP 1a — corrigé : algorithmique.

    python corrige.py      (depuis le dossier tp1a-algorithmique)

Chaque fonction est suivie de commentaires qui expliquent les choix, et des pièges
rencontrés le plus souvent. L'étape 4 montre aussi d'autres façons de compter.
"""
from collections import Counter, defaultdict


# Étape 2 : FizzBuzz et nombres premiers -------------------------------------------
def fizzbuzz(n):
    """Les nombres de 1 à n, Fizz pour les multiples de 3, Buzz de 5, FizzBuzz des deux."""
    resultat = []
    for i in range(1, n + 1):          # range s'arrête AVANT sa borne : n + 1 pour inclure n
        if i % 15 == 0:                # en premier : sinon 15 tomberait dans « Fizz »,
            resultat.append("FizzBuzz")    # car seule la première branche vraie s'exécute
        elif i % 3 == 0:
            resultat.append("Fizz")
        elif i % 5 == 0:
            resultat.append("Buzz")
        else:
            resultat.append(str(i))    # du texte, pas un nombre : la vérification attend "13"
    return resultat


def est_premier(n):
    """Vrai si n est premier : aucun diviseur entre 2 et la racine de n."""
    if n < 2:                          # 0 et 1 ne sont pas premiers : réglé tout de suite
        return False
    d = 2
    # Les diviseurs vont par paires (36 = 4 × 9) : l'un des deux est <= racine de n.
    # Rien trouvé jusqu'à la racine, rien à trouver après. On écrit d * d <= n
    # plutôt que d <= n ** 0.5 : que des entiers, pas d'arrondi de flottant.
    while d * d <= n:
        if n % d == 0:
            return False               # un diviseur suffit : on sort aussitôt
        d += 1                         # sans cette ligne, d reste à 2 : boucle infinie
    return True                        # atteint seulement si la boucle n'a rien trouvé


def premiers_jusqua(n):
    """Les nombres premiers strictement inférieurs à n."""
    # Se lit comme la phrase : « les i de range(n) pour lesquels est_premier(i) ».
    # Pas besoin d'exclure 0 et 1 ici : est_premier s'en charge.
    return [i for i in range(n) if est_premier(i)]


# Étape 3 : la plus longue série ------------------------------------------------------
def plus_longue_serie(valeurs, seuil):
    """La longueur de la plus longue suite de valeurs consécutives au-dessus du seuil."""
    # Deux compteurs : la série en train de se former, et le record vu jusqu'ici.
    meilleure = courante = 0
    for v in valeurs:
        if v > seuil:                  # strictement au-dessus
            courante += 1
            # Le record se met à jour TOUT DE SUITE. Si on attendait que la série
            # se casse (dans le else), on raterait une série qui finit la liste.
            meilleure = max(meilleure, courante)
        else:
            courante = 0               # la série casse ; le record, lui, reste
    return meilleure

# Déroulé avec le seuil 40 :
#   valeur     38.7  41.2  45.0  52.1  39.0  47.0  48.3
#   courante     0     1     2     3     0     1     2
#   meilleure    0     1     2     3     3     3     3


# Étape 4 : compter les niveaux ---------------------------------------------------------
def compter_niveaux(lignes):
    """Compte les niveaux (INFO, WARN, ERROR…) : le deuxième mot de chaque ligne."""
    compte = {}
    for ligne in lignes:               # une liste, ou un fichier ouvert : un for parcourt les deux
        mots = ligne.split()           # sans argument : coupe sur les espaces, même plusieurs
        if len(mots) >= 2:             # une ligne vide ferait planter mots[1]
            niveau = mots[1]           # le deuxième mot : on compte à partir de 0
            # get(niveau, 0) : la première fois, la clé n'existe pas et get rend 0
            # au lieu de lever une KeyError ; ensuite, il rend le compte déjà fait.
            compte[niveau] = compte.get(niveau, 0) + 1
    return compte


# Étape 4, d'autres façons de compter ---------------------------------------------------
# Toutes donnent le même dictionnaire. Pour le TP, retenez get : c'est le schéma de base.

def compter_niveaux_sans_get(lignes):
    """Sans get : on crée la clé à 0 la première fois, puis on incrémente."""
    compte = {}
    for ligne in lignes:
        mots = ligne.split()
        if len(mots) >= 2:
            niveau = mots[1]
            # compte[niveau] = compte[niveau] + 1 SEUL lève une KeyError à la première
            # rencontre : Python évalue d'abord la droite, donc LIT une clé absente.
            if niveau not in compte:
                compte[niveau] = 0
            compte[niveau] = compte[niveau] + 1
    return compte


def compter_niveaux_defaultdict(lignes):
    """defaultdict(int) : une clé absente vaut automatiquement int(), c'est-à-dire 0."""
    compte = defaultdict(int)
    for ligne in lignes:
        mots = ligne.split()
        if len(mots) >= 2:
            compte[mots[1]] += 1       # plus de KeyError : la clé est créée à 0
    return dict(compte)                # un dict ordinaire, pour comparer et afficher


def compter_niveaux_counter(lignes):
    """Counter : la bibliothèque standard fait tout le comptage."""
    # Une expression génératrice fournit les niveaux, Counter les compte.
    return dict(Counter(mots[1] for mots in (ligne.split() for ligne in lignes) if len(mots) >= 2))


# Bonus -------------------------------------------------------------------------------
def moyenne_glissante(valeurs, k=3):
    """La moyenne de chaque fenêtre de k valeurs consécutives, arrondie au dixième."""
    # valeurs[i:i + k] : la fenêtre de k relevés qui commence à i (la fin est exclue).
    # 7 relevés, fenêtres de 3 : len - k + 1 = 5 fenêtres.
    return [round(sum(valeurs[i:i + k]) / k, 1) for i in range(len(valeurs) - k + 1)]


def moyenne_glissante_boucle(valeurs, k=3):
    """La même chose avec une boucle : plus longue, souvent plus lisible pour commencer."""
    resultat = []
    for i in range(len(valeurs) - k + 1):
        fenetre = valeurs[i:i + k]
        resultat.append(round(sum(fenetre) / k, 1))
    return resultat


if __name__ == "__main__":
    print(" ".join(fizzbuzz(15)))
    print(premiers_jusqua(30))
    serie = [38.7, 41.2, 45.0, 52.1, 39.0, 47.0, 48.3]
    print("Plus longue série > 40 :", plus_longue_serie(serie, 40))
    print(compter_niveaux(["t INFO", "t ERROR", "t INFO", "t WARN", "t INFO", "t ERROR"]))

    # Le fichier ouvert se passe tel quel : pas besoin de f.readlines(), qui chargerait
    # tout en mémoire. Le chemin part du dossier courant : ../ remonte d'un niveau.
    with open("../donnees/journal-capteurs.log", encoding="utf-8") as f:
        niveaux = compter_niveaux(f)
    print("Niveaux du journal     :", niveaux)

    # Les autres façons de compter donnent exactement le même résultat
    for autre in (compter_niveaux_sans_get, compter_niveaux_defaultdict, compter_niveaux_counter):
        with open("../donnees/journal-capteurs.log", encoding="utf-8") as f:
            print(f"  {autre.__name__:28} identique : {autre(f) == niveaux}")

    # Le niveau 'I' vient d'une ligne tronquée pendant l'envoi : la retrouver.
    # [1:2] plutôt que [1] : un découpage ne lève jamais d'erreur, même sur une ligne
    # d'un seul mot. enumerate(..., start=1) numérote comme un éditeur.
    with open("../donnees/journal-capteurs.log", encoding="utf-8") as f:
        for numero, ligne in enumerate(f, start=1):
            if ligne.split()[1:2] == ["I"]:
                print(f"  ligne {numero} : {ligne.rstrip()!r}")
    print("Moyenne glissante      :", moyenne_glissante(serie))
    print("  version boucle identique :", moyenne_glissante_boucle(serie) == moyenne_glissante(serie))
