"""Génère le jeu de données Air'Cité : un réseau FICTIF de 12 capteurs de qualité de l'air.

    python donnees/generer_donnees.py

Écrit, dans donnees/ :
    capteurs.db            la base SQLite des capteurs (table capteurs)
    journal-capteurs.log   le journal brut, tel que les capteurs l'émettent (TP 2)
    mesures.csv            la copie de référence de ce que produit le TP 2 (TP 3, TP 4)
et copie les fichiers d'entrée dans les dossiers des TP 1b, 2a et 2b.

Le tirage est déterministe (graines fixes) : tout le monde obtient les mêmes chiffres,
ceux des slides et des corrigés. Il demande NumPy et pandas (fournis par Anaconda).
"""
import csv
import shutil
import sqlite3
from pathlib import Path

import numpy as np
import pandas as pd

ICI = Path(__file__).resolve().parent
TP = ICI.parent

CAPTEURS = [
    ("AQ-01", "Hôtel de Ville", "Centre", 45.7640, 4.8357, "2024-03-01"),
    ("AQ-02", "Place des Halles", "Centre", 45.7652, 4.8380, "2024-03-01"),
    ("AQ-03", "Rue Neuve", "Centre", 45.7628, 4.8331, "2024-06-15"),
    ("AQ-04", "Parvis de la Gare", "Gare", 45.7605, 4.8590, "2024-03-01"),
    ("AQ-05", "Boulevard Ferroviaire", "Gare", 45.7590, 4.8612, "2025-01-10"),
    ("AQ-06", "Pont du Chemin", "Gare", 45.7618, 4.8565, "2025-01-10"),
    ("AQ-07", "Quai des Docks", "Port", 45.7480, 4.8270, "2024-09-02"),
    ("AQ-08", "Écluse Nord", "Port", 45.7502, 4.8245, "2024-09-02"),
    ("AQ-09", "Bassin Sud", "Port", 45.7465, 4.8301, "2025-04-20"),
    ("AQ-10", "Campus Est", "Université", 45.7810, 4.8650, "2024-11-05"),
    ("AQ-11", "Bibliothèque", "Université", 45.7795, 4.8622, "2024-11-05"),
    ("AQ-12", "Stade", "Université", 45.7830, 4.8688, "2025-04-20"),
]
# Niveau de fond du NO2 par quartier, en µg/m³
BASE = {"Centre": 38, "Gare": 34, "Port": 27, "Université": 18}
DEBUT, JOURS = "2026-03-02", 28


def ecrire_base(chemin):
    chemin.unlink(missing_ok=True)
    conn = sqlite3.connect(chemin)
    with conn:
        conn.execute("CREATE TABLE capteurs(id TEXT, nom TEXT, quartier TEXT,"
                     " lat REAL, lon REAL, mise_en_service TEXT)")
        conn.executemany("INSERT INTO capteurs VALUES (?, ?, ?, ?, ?, ?)", CAPTEURS)
    conn.close()


def tirer_mesures():
    """Une mesure par capteur et par heure, avec le cycle du trafic (8 h et 18 h)."""
    rng = np.random.default_rng(2026)
    h = pd.date_range(DEBUT, periods=JOURS * 24, freq="h")
    heure = h.hour.to_numpy()
    semaine = (h.dayofweek < 5).astype(float)
    pointe = np.exp(-(heure - 8) ** 2 / 3) + .8 * np.exp(-(heure - 18) ** 2 / 4)
    blocs = []
    for cid, nom, q, lat, lon, _ in CAPTEURS:
        base = BASE[q] * rng.uniform(.85, 1.15)
        no2 = base * (.55 + (.5 + .5 * semaine) * 1.1 * pointe) + rng.normal(0, 4, len(h))
        temp = (9 + 5 * np.sin((heure - 9) / 24 * 2 * np.pi) + rng.normal(0, 1, len(h))
                + np.linspace(0, 4, len(h)))
        pm10 = .45 * no2 + 6 + rng.normal(0, 3, len(h))
        d = pd.DataFrame({"horodatage": h, "capteur": cid, "quartier": q,
                          "no2": no2.clip(1).round(1), "pm10": pm10.clip(1).round(1),
                          "temp": temp.round(1)})
        d.loc[rng.random(len(h)) < .02, "no2"] = np.nan   # environ 2 % de trous
        blocs.append(d)
    return pd.concat(blocs, ignore_index=True)


def texte(v):
    return "" if pd.isna(v) else f"{v:.1f}"


def ecrire_journal(mesures, chemin):
    """Le journal chronologique, avec ses défauts : erreurs, alertes, lignes
    tronquées puis réémises, et un capteur de test absent de la base."""
    rng = np.random.default_rng(7)
    lignes = []
    m = mesures.sort_values(["horodatage", "capteur"], kind="stable")
    test = set(pd.date_range("2026-03-16 09:00", periods=30, freq="h"))
    for ts, groupe in m.groupby("horodatage", sort=True):
        iso = ts.strftime("%Y-%m-%dT%H:%M:%S")
        for r in groupe.itertuples(index=False):
            ligne = (f"{iso} INFO  {r.capteur} no2={texte(r.no2)}"
                     f" pm10={texte(r.pm10)} temp={texte(r.temp)}")
            tirage = rng.random()
            if tirage < .004:                       # tronquée, puis réémise entière
                lignes.append(ligne[:int(rng.integers(20, len(ligne) - 8))])
            lignes.append(ligne)
            if .004 <= tirage < .012:
                motif = ["timeout", "redémarrage", "calibration hors tolérance"][int(rng.integers(3))]
                lignes.append(f"{iso} ERROR {r.capteur} {motif}")
            elif .012 <= tirage < .018:
                lignes.append(f"{iso} WARN  {r.capteur} batterie faible ({int(rng.integers(8, 20))} %)")
        if ts in test:                              # capteur de test, jamais enregistré
            lignes.append(f"{iso} INFO  AQ-13 no2={rng.uniform(10, 40):.1f}"
                          f" pm10={rng.uniform(8, 25):.1f} temp={rng.uniform(5, 14):.1f}")
    chemin.write_text("\n".join(lignes) + "\n", encoding="utf-8")
    return len(lignes)


def ecrire_mesures_csv(mesures, chemin):
    """Exactement ce que produit le corrigé du TP 2 : trié par capteur puis par heure,
    horodatage ISO tel que dans le journal, valeur manquante = cellule vide."""
    with open(chemin, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["horodatage", "capteur", "quartier", "no2", "pm10", "temp"])
        for r in mesures.itertuples(index=False):
            w.writerow([r.horodatage.strftime("%Y-%m-%dT%H:%M:%S"), r.capteur, r.quartier,
                        texte(r.no2), texte(r.pm10), texte(r.temp)])


def ecrire_horodatages_tp1(mesures, chemin):
    """TP 1 : les horodatages d'AQ-03 sur la première semaine, avec quelques heures perdues."""
    rng = np.random.default_rng(3)
    ts = mesures.loc[mesures["capteur"] == "AQ-03", "horodatage"].iloc[:7 * 24]
    perdues = set(rng.choice(len(ts), size=6, replace=False))
    garde = [t.strftime("%Y-%m-%dT%H:%M:%S") for i, t in enumerate(ts) if i not in perdues]
    chemin.write_text("\n".join(garde) + "\n", encoding="utf-8")
    return 7 * 24 - len(garde)


def main():
    mesures = tirer_mesures()
    ecrire_base(ICI / "capteurs.db")
    n = ecrire_journal(mesures, ICI / "journal-capteurs.log")
    ecrire_mesures_csv(mesures, ICI / "mesures.csv")
    perdues = ecrire_horodatages_tp1(mesures, TP / "tp1b-modules-dates" / "horodatages-aq03.txt")
    for nom in ("capteurs.db", "journal-capteurs.log"):
        shutil.copy(ICI / nom, TP / "tp2b-logs-sqlite-csv" / nom)
    extrait = (ICI / "journal-capteurs.log").read_text(encoding="utf-8").splitlines()[:120]
    (TP / "tp2a-classes-fichiers" / "extrait-journal.log").write_text(
        "\n".join(extrait) + "\n", encoding="utf-8")
    print(f"capteurs.db            {len(CAPTEURS)} capteurs")
    print(f"journal-capteurs.log   {n} lignes")
    print(f"mesures.csv            {len(mesures)} mesures, {mesures['no2'].isna().sum()} NO2 manquants")
    print(f"horodatages-aq03.txt   {7 * 24 - perdues} heures, {perdues} perdues")


if __name__ == "__main__":
    main()
