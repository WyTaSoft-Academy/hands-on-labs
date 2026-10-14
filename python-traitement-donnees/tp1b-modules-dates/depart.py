"""TP 1b — point de départ : un module à soi, et les dates.

    python depart.py      (depuis le dossier tp1b-modules-dates)

Étapes 1 et 2 : voir enonce.md (vous créez outils.py vous-même).
Étapes 3 et 4 : complétez les deux fonctions ci-dessous, puis relancez :
les vérifications en bas du fichier affichent OK ou ÉCHEC.
"""
from datetime import datetime, timedelta

JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]


def lire_horodatages(chemin):
    """La liste des datetime du fichier, une ligne au format 2026-03-02T14:00:00."""
    # TODO : open(..., encoding="utf-8"), datetime.strptime(texte, "%Y-%m-%dT%H:%M:%S")
    return []


def heures_manquantes(horodatages):
    """Les heures absentes entre la première et la dernière, triées.
    Indice : l'ensemble des heures attendues (timedelta(hours=1)) moins l'ensemble des présentes."""
    # TODO
    return []


# Vérifications --------------------------------------------------------------------
def verifier(nom, obtenu, attendu):
    print(f"{'OK    ' if obtenu == attendu else 'ÉCHEC '} {nom}")
    if obtenu != attendu:
        print(f"         obtenu  : {obtenu!r}\n         attendu : {attendu!r}")


if __name__ == "__main__":
    hs = lire_horodatages("horodatages-aq03.txt")
    verifier("dates lues", len(hs), 162)
    verifier("première date", hs[0] if hs else None, datetime(2026, 3, 2, 0, 0))
    manquantes = heures_manquantes(hs) if hs else []
    verifier("heures manquantes", len(manquantes), 6)
    verifier("dont le mardi 3 mars", sum(1 for h in manquantes if h.day == 3), 3)
