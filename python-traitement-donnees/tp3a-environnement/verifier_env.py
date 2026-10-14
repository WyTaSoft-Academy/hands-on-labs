"""TP 3 — vérifie l'environnement actif.

    python verifier_env.py

À lancer dans l'environnement aircite, puis dans un notebook (%run verifier_env.py) :
les deux doivent afficher le même interpréteur.
"""
import importlib
import sys

print(f"Python      {sys.version.split()[0]}")
print(f"Interpréteur {sys.executable}")
print(f"Préfixe      {sys.prefix}")
if "aircite" not in sys.prefix and ".venv" not in sys.prefix:
    print("  ATTENTION : ni 'aircite' ni '.venv' dans le préfixe : est-ce le bon environnement ?")

manque = []
for nom in ["numpy", "pandas", "matplotlib", "scipy", "pyarrow", "openpyxl", "ipykernel"]:
    try:
        version = importlib.import_module(nom).__version__
        print(f"  OK  {nom:<11} {version}")
    except ImportError:
        print(f"  --  {nom:<11} absent")
        manque.append(nom)

import pandas
if int(pandas.__version__.split(".")[0]) >= 3:
    print("  ATTENTION : pandas 3 installé ; la formation a été préparée sous pandas 2.3.")

if manque:
    print(f"\nÀ installer : {' '.join(manque)}")
    sys.exit(1)
print("\nEnvironnement prêt.")
