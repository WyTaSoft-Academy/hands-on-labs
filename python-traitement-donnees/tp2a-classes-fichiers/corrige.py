"""TP 2a — corrigé : une classe et un fichier.

    python corrige.py      (depuis le dossier tp2a-classes-fichiers)

Lit extrait-journal.csv (les dix premières heures du journal), range les mesures de NO2
dans un objet Capteur par identifiant, puis écrit resume.csv.
"""
import csv


class Capteur:
    seuil_no2 = 40.0                     # attribut de classe : le même pour tous

    def __init__(self, id):
        self.id = id
        self.mesures = []                # attribut d'instance : une liste par capteur
        self.manquantes = 0

    def ajouter(self, texte):
        """Ajoute une mesure lue dans le journal ; une valeur vide est comptée à part."""
        if texte == "":
            self.manquantes += 1
        else:
            self.mesures.append(float(texte))

    def moyenne(self):
        if not self.mesures:
            return None
        return sum(self.mesures) / len(self.mesures)

    def maximum(self):
        return max(self.mesures) if self.mesures else None

    def __repr__(self):
        return f"Capteur({self.id!r}, {len(self.mesures)} mesures)"

    def __lt__(self, autre):             # pour trier : du moins au plus exposé
        return self.moyenne() < autre.moyenne()


def lire(chemin):
    """Un dictionnaire identifiant → Capteur, et le nombre de lignes écartées."""
    capteurs = {}
    ecartees = 0
    with open(chemin, encoding="utf-8", newline="") as f:
        lecteur = csv.reader(f)              # chaque ligne arrive en liste de champs
        next(lecteur)                        # la ligne d'en-tête : ni mesure, ni écartée
        for champs in lecteur:
            # Une mesure complète : horodatage, INFO, capteur, no2, pm10, temp, message
            if len(champs) != 7 or champs[1] != "INFO":
                ecartees += 1
                continue
            id = champs[2]
            no2 = champs[3]                      # "41.2", ou "" si la mesure manque
            if id not in capteurs:
                capteurs[id] = Capteur(id)
            capteurs[id].ajouter(no2)
    return capteurs, ecartees


def ecrire_resume(capteurs, chemin):
    with open(chemin, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["capteur", "mesures", "manquantes", "no2_moyen", "no2_max"])
        for id in sorted(capteurs):
            c = capteurs[id]
            w.writerow([c.id, len(c.mesures), c.manquantes,
                        round(c.moyenne(), 1), c.maximum()])


if __name__ == "__main__":
    capteurs, ecartees = lire("extrait-journal.csv")
    print(len(capteurs), "capteurs,", ecartees, "lignes écartées")
    print(capteurs["AQ-01"], "manquantes :", capteurs["AQ-01"].manquantes)
    print("Moyenne d'AQ-03 :", round(capteurs["AQ-03"].moyenne(), 1))
    tries = sorted(capteurs.values(), reverse=True)
    print("Les trois plus exposés :", [c.id for c in tries[:3]])
    ecrire_resume(capteurs, "resume.csv")
    with open("resume.csv", encoding="utf-8") as f:
        print(f.read(), end="")
