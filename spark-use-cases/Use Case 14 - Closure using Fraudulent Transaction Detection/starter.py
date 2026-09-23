transactions = [
    {"id": 1, "montant": 500, "carte": "crédit", "pays": "US", "heure": "10:00"},
    {"id": 2, "montant": 2000, "carte": "débit", "pays": "FR", "heure": "15:30"},
    {"id": 3, "montant": 1500, "carte": "crédit", "pays": "IN", "heure": "11:00"},
    {"id": 4, "montant": 300, "carte": "débit", "pays": "US", "heure": "09:45"}
]

facteurs_risque = {
    "crédit": {"seuil_montant": 1000, "risque": 1.2},
    "débit": {"seuil_montant": 500, "risque": 1.5},
    "US": {"risque": 1.1},
    "IN": {"risque": 2.0},
    "FR": {"risque": 1.0}
}
