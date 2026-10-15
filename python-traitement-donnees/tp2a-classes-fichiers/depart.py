"""TP 2a — point de départ : une classe et un fichier.

    python depart.py      (depuis le dossier tp2a-classes-fichiers)

Complétez les TODO, puis relancez : les vérifications en bas du fichier affichent
OK ou ÉCHEC. Pas de regex aujourd'hui : le module csv découpe les lignes.
"""
import csv


class Capteur:
    seuil_no2 = 40.0

    def __init__(self, id):
        # TODO : l'identifiant, une liste de mesures PROPRE à chaque capteur,
        #        et un compteur de valeurs manquantes à 0
        pass

    def ajouter(self, texte):
        """texte vaut "41.2", ou "" si la mesure manque : la convertir, ou compter le manque."""
        # TODO
        pass

    def moyenne(self):
        """La moyenne des mesures, ou None s'il n'y en a aucune."""
        # TODO
        return None

    def maximum(self):
        # TODO
        return None

    # TODO : __repr__ → Capteur('AQ-01', 9 mesures)
    # TODO (bonus) : __lt__, pour trier les capteurs par moyenne


def lire(chemin):
    """Rend (capteurs, ecartees) : un dictionnaire identifiant → Capteur, et le nombre
    de lignes qui ne sont pas une mesure complète (7 champs, niveau INFO)."""
    capteurs = {}
    ecartees = 0
    # TODO : with open(chemin, encoding="utf-8", newline="") as f: … csv.reader(f) …
    #        next(lecteur) passe la ligne d'en-tête ; chaque ligne suivante est une liste,
    #        et le NO2 est champs[3] : "41.2", ou "" s'il manque
    return capteurs, ecartees


def ecrire_resume(capteurs, chemin):
    """resume.csv : capteur,mesures,manquantes,no2_moyen,no2_max, un capteur par ligne,
    triés par identifiant, moyenne arrondie au dixième."""
    # TODO : open(chemin, "w", encoding="utf-8", newline=""), csv.writer
    pass


# Vérifications --------------------------------------------------------------------
def verifier(nom, obtenu, attendu):
    print(f"{'OK    ' if obtenu == attendu else 'ÉCHEC '} {nom}")
    if obtenu != attendu:
        print(f"         obtenu  : {obtenu!r}\n         attendu : {attendu!r}")


if __name__ == "__main__":
    a, b = Capteur("AQ-01"), Capteur("AQ-02")
    if hasattr(a, "mesures"):
        a.ajouter("41.2")
        verifier("une liste par capteur", (len(a.mesures), len(b.mesures)), (1, 0))
    capteurs, ecartees = lire("extrait-journal.csv")
    verifier("capteurs lus", len(capteurs), 12)
    verifier("lignes écartées", ecartees, 4)
    if "AQ-01" in capteurs:
        verifier("repr", repr(capteurs["AQ-01"]), "Capteur('AQ-01', 9 mesures)")
        verifier("manquantes d'AQ-01", getattr(capteurs["AQ-01"], "manquantes", None), 1)
        m = capteurs["AQ-03"].moyenne()
        verifier("moyenne d'AQ-03", round(m, 1) if m is not None else None, 34.1)
    import os
    if os.path.exists("resume.csv"):
        os.remove("resume.csv")          # pour ne pas vérifier un fichier d'un essai précédent
    ecrire_resume(capteurs, "resume.csv")
    try:
        with open("resume.csv", encoding="utf-8") as f:
            lignes = f.read().splitlines()
        verifier("resume.csv", lignes[:2], ["capteur,mesures,manquantes,no2_moyen,no2_max",
                                            "AQ-01,9,1,30.5,55.8"])
    except FileNotFoundError:
        verifier("resume.csv", "absent", "écrit")
