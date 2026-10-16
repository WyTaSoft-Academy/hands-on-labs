"""TP 1b — corrigé de l'étape 1 : le module outils.py.

C'est le fichier que chacun crée sous le nom outils.py ; il s'appelle ici
corrige_outils.py pour ne pas écraser le vôtre.

    python corrige_outils.py     le bloc de test s'exécute
    import corrige_outils         le bloc de test ne s'exécute pas
"""


def plus_longue_serie(valeurs, seuil):
    """La longueur de la plus longue suite de valeurs consécutives au-dessus du seuil."""
    meilleure = courante = 0
    for v in valeurs:
        if v > seuil:
            courante += 1
            meilleure = max(meilleure, courante)
        else:
            courante = 0
    return meilleure


def compter_niveaux(lignes):
    """Compte les niveaux (INFO, WARN, ERROR…) : le deuxième mot de chaque ligne."""
    compte = {}
    for ligne in lignes:
        mots = ligne.split()
        if len(mots) >= 2:
            compte[mots[1]] = compte.get(mots[1], 0) + 1
    return compte


if __name__ == "__main__":
    print("Test de corrige_outils, lancé comme script")
    assert plus_longue_serie([38.7, 41.2, 45.0, 52.1, 39.0, 47.0, 48.3], 40) == 3
    assert compter_niveaux(["t INFO", "t ERROR", "t INFO"]) == {"INFO": 2, "ERROR": 1}
    print("OK")
