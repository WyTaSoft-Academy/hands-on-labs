"""TP 1b — corrigé : un module à soi, et les dates.

    python corrige.py      (depuis le dossier tp1b-modules-dates)
"""
from collections import Counter
from datetime import datetime, timedelta

# Étape 2 : importer le module. Le bloc de test de corrige_outils ne s'affiche pas.
from corrige_outils import plus_longue_serie

print("Import réussi :", plus_longue_serie([41.0, 42.5, 39.9, 44.1], 40))

# Étape 3 : lire les horodatages -----------------------------------------------------
JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]


def lire_horodatages(chemin):
    with open(chemin, encoding="utf-8") as f:
        return [datetime.strptime(l.strip(), "%Y-%m-%dT%H:%M:%S") for l in f if l.strip()]


# Étape 4 : compter et chercher -------------------------------------------------------
def heures_manquantes(horodatages):
    """Les heures attendues entre la première et la dernière, moins celles présentes."""
    debut, fin = min(horodatages), max(horodatages)
    attendues = set()
    h = debut
    while h <= fin:
        attendues.add(h)
        h += timedelta(hours=1)
    return sorted(attendues - set(horodatages))


if __name__ == "__main__":
    hs = lire_horodatages("horodatages-aq03.txt")
    print(f"{len(hs)} horodatages, du {hs[0]:%d/%m %H:%M} au {hs[-1]:%d/%m %H:%M}")
    par_jour = Counter(JOURS[h.weekday()] for h in hs)
    for jour in JOURS:
        print(f"  {jour:<9} {par_jour[jour]:3d}")
    for h in heures_manquantes(hs):
        print(f"  manquante : {JOURS[h.weekday()]} {h:%d/%m à %Hh}")
    # Bonus : une soustraction de deux datetime donne un timedelta
    print("Écart entre la première et la dernière mesure :", hs[-1] - hs[0])
