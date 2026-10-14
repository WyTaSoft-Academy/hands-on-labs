"""TP 1a — point de départ : algorithmique.

    python depart.py      (depuis le dossier tp1a-algorithmique)

Complétez chaque fonction, puis relancez : les vérifications en bas du fichier
affichent OK ou ÉCHEC. Bloqué sur une fonction, passez à la suivante.
"""


# Étape 2 : FizzBuzz et nombres premiers -------------------------------------------
def fizzbuzz(n):
    """Les nombres de 1 à n (en texte), Fizz pour les multiples de 3, Buzz de 5, FizzBuzz des deux."""
    # TODO
    return []


def est_premier(n):
    """Vrai si n est premier. Indice : chercher un diviseur d tant que d * d <= n."""
    # TODO
    return False


def premiers_jusqua(n):
    """Les nombres premiers strictement inférieurs à n."""
    # TODO : une compréhension de liste qui utilise est_premier
    return []


# Étape 3 : la plus longue série ------------------------------------------------------
def plus_longue_serie(valeurs, seuil):
    """La longueur de la plus longue suite de valeurs consécutives strictement au-dessus du seuil."""
    # TODO : deux compteurs, la série courante et la meilleure
    return 0


# Étape 4 : compter les niveaux ---------------------------------------------------------
def compter_niveaux(lignes):
    """Un dictionnaire niveau → nombre de lignes. Le niveau est le deuxième mot de la ligne."""
    # TODO : split(), et dict.get(cle, 0) + 1
    return {}


# Bonus -------------------------------------------------------------------------------
def moyenne_glissante(valeurs, k=3):
    """La moyenne de chaque fenêtre de k valeurs consécutives, arrondie au dixième."""
    # TODO
    return []


# Vérifications --------------------------------------------------------------------
def verifier(nom, obtenu, attendu):
    print(f"{'OK    ' if obtenu == attendu else 'ÉCHEC '} {nom}")
    if obtenu != attendu:
        print(f"         obtenu  : {obtenu!r}\n         attendu : {attendu!r}")


if __name__ == "__main__":
    serie = [38.7, 41.2, 45.0, 52.1, 39.0, 47.0, 48.3]
    verifier("fizzbuzz", fizzbuzz(15)[-3:], ["13", "14", "FizzBuzz"])
    verifier("premiers", premiers_jusqua(30), [2, 3, 5, 7, 11, 13, 17, 19, 23, 29])
    verifier("série", plus_longue_serie(serie, 40), 3)
    verifier("niveaux", compter_niveaux(["t INFO", "t ERROR", "t INFO", "t WARN", "t INFO", "t ERROR"]),
             {"INFO": 3, "ERROR": 2, "WARN": 1})
    with open("../donnees/journal-capteurs.log", encoding="utf-8") as f:
        verifier("niveaux du vrai journal", compter_niveaux(f),
                 {"INFO": 8121, "ERROR": 66, "WARN": 58, "I": 1})
    verifier("glissante (bonus)", moyenne_glissante(serie), [41.6, 46.1, 45.4, 46.0, 44.8])
