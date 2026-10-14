"""TP 2b — point de départ : du journal des capteurs à mesures.csv.

    python depart.py      (depuis le dossier tp2b-logs-sqlite-csv)

Complétez les TODO dans l'ordre. Chaque étape s'exécute seule : commencez petit.
"""
import csv
import re
import sqlite3
from collections import Counter

# Étape 1 : la base -------------------------------------------------------------
conn = sqlite3.connect("capteurs.db")
# TODO : afficher le nombre de capteurs par quartier (SELECT … GROUP BY quartier)
# TODO : quartier_de = dict(conn.execute("SELECT id, quartier FROM capteurs"))
quartier_de = {}
conn.close()

# Étape 2 : la regex ------------------------------------------------------------
EXEMPLES = [
    "2026-03-02T00:00:00 INFO  AQ-01 no2= pm10=12.1 temp=5.5",
    "2026-03-02T00:00:00 INFO  AQ-02 no2=25.6 pm10=15.9 temp=5.4",
    "2026-03-02T00:00:00 ERROR AQ-07 redémarrage",
    "2026-03-02T03:00:00 INFO  AQ-01 no2=21.",
    "2026-03-02T03:00:00 INFO  AQ-01 no2=21.4 pm10=15.6 temp=4.4",
    "2026-03-02T09:00:00 WARN  AQ-11 batterie faible (18 %)",
]

MESURE = re.compile(r"""
    ^(?P<horodatage>\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d)
    \s+INFO\s+
    # TODO : le capteur (AQ- suivi de deux chiffres), puis no2=, pm10=, temp=
    # Attention : no2 peut être vide, temp peut être négative.
""", re.VERBOSE)

for ligne in EXEMPLES:
    m = MESURE.match(ligne)
    print("OK   " if m else "REJET", ligne[20:], m.groupdict() if m else "")

# Étapes 3 et 4 : lire, écrire, compter -------------------------------------------
lignes_ecrites = []
rejets = Counter()
total = 0
with open("journal-capteurs.log", encoding="utf-8") as src:
    for ligne in src:
        total += 1
        # TODO : reconnaître la mesure, sinon compter le rejet par cause
        # TODO : trouver le quartier ; capteur inconnu → compté, pas avalé
        pass

# TODO : trier lignes_ecrites par (capteur, horodatage), puis écrire mesures.csv
#        avec csv.writer, newline="" et encoding="utf-8"

print(f"Lignes du journal : {total}")
print(f"Mesures écrites   : {len(lignes_ecrites)}")
print(f"Rejets            : {dict(rejets)}")
# Le contrôle qui compte : écrites + rejets == total
