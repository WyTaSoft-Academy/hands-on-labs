"""TP 2b — corrigé : du journal des capteurs à mesures.csv.

    python corrige.py

Lit capteurs.db et journal-capteurs.log (dans ce dossier), écrit mesures.csv,
et affiche les lignes écrites et les rejets par cause.
"""
import csv
import re
import sqlite3
from collections import Counter

# Étape 1 : la base -------------------------------------------------------------
conn = sqlite3.connect("capteurs.db")
par_quartier = conn.execute(
    "SELECT quartier, COUNT(*) FROM capteurs GROUP BY quartier ORDER BY quartier").fetchall()
quartier_de = dict(conn.execute("SELECT id, quartier FROM capteurs"))
conn.close()
print("Capteurs par quartier :", par_quartier)

# Étape 2 : la regex ------------------------------------------------------------
MESURE = re.compile(r"""
    ^(?P<horodatage>\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d)
    \s+INFO\s+
    (?P<capteur>AQ-\d{2})
    \s+no2=(?P<no2>[\d.]*)        # vide si la mesure manque
    \s+pm10=(?P<pm10>[\d.]*)
    \s+temp=(?P<temp>-?[\d.]*)$
""", re.VERBOSE)

# Étapes 3 et 4 : lire, classer, compter -----------------------------------------
lignes_ecrites = []
rejets = Counter()
total = 0
with open("journal-capteurs.log", encoding="utf-8") as src:
    for ligne in src:
        total += 1
        ligne = ligne.rstrip("\n")
        m = MESURE.match(ligne)
        if m is None:
            if " ERROR " in ligne:
                rejets["ERROR"] += 1
            elif " WARN " in ligne:
                rejets["WARN"] += 1
            else:
                rejets["illisible"] += 1
            continue
        d = m.groupdict()
        quartier = quartier_de.get(d["capteur"])
        if quartier is None:              # capteur absent de la base : compté, pas avalé
            rejets["capteur inconnu"] += 1
            continue
        lignes_ecrites.append([d["horodatage"], d["capteur"], quartier,
                               d["no2"], d["pm10"], d["temp"]])

# Trier par capteur puis par heure : un fichier stable, comparable au corrigé
lignes_ecrites.sort(key=lambda r: (r[1], r[0]))

with open("mesures.csv", "w", encoding="utf-8", newline="") as dst:
    w = csv.writer(dst)
    w.writerow(["horodatage", "capteur", "quartier", "no2", "pm10", "temp"])
    w.writerows(lignes_ecrites)

print(f"Lignes du journal : {total}")
print(f"Mesures écrites   : {len(lignes_ecrites)}")
print(f"Rejets            : {dict(rejets)}")
print(f"Contrôle          : {len(lignes_ecrites)} + {sum(rejets.values())} = "
      f"{len(lignes_ecrites) + sum(rejets.values())}")
assert len(lignes_ecrites) + sum(rejets.values()) == total
manquants = sum(1 for r in lignes_ecrites if r[3] == "")
print(f"NO2 manquants     : {manquants} (cellules vides)")


# Bonus : une classe Capteur, et les capteurs en alerte ----------------------------
SEUIL = 60.0   # µg/m³ sur une heure


class Capteur:
    def __init__(self, id, quartier):
        self.id = id
        self.quartier = quartier
        self._no2 = []

    def ajouter(self, no2):
        if no2 != "":
            self._no2.append(float(no2))

    @property
    def depassements(self):
        return sum(1 for v in self._no2 if v > SEUIL)

    def __repr__(self):
        return f"Capteur({self.id!r}, {self.quartier!r})"


capteurs = {}
for horodatage, cid, quartier, no2, pm10, temp in lignes_ecrites:
    if cid not in capteurs:
        capteurs[cid] = Capteur(cid, quartier)
    capteurs[cid].ajouter(no2)

alertes = sorted((c for c in capteurs.values() if c.depassements > 0),
                 key=lambda c: c.depassements, reverse=True)
with open("alertes.txt", "w", encoding="utf-8") as f:
    for c in alertes:
        print(f"{c.id}  {c.quartier:<11} {c.depassements:3d} heures > {SEUIL:g} µg/m³", file=f)

conn = sqlite3.connect("capteurs.db")
with conn:
    conn.execute("DROP TABLE IF EXISTS alertes")
    conn.execute("CREATE TABLE alertes(capteur TEXT, horodatage TEXT, no2 REAL)")
    conn.executemany("INSERT INTO alertes VALUES (?, ?, ?)",
                     [(cid, h, float(no2)) for h, cid, q, no2, p, t in lignes_ecrites
                      if no2 != "" and float(no2) > SEUIL])
n_alertes = conn.execute("SELECT COUNT(*) FROM alertes").fetchone()[0]
conn.close()
print(f"Bonus : {len(alertes)} capteurs en alerte, {n_alertes} heures dans la table alertes")
print(open("alertes.txt", encoding="utf-8").read(), end="")
