# TP 3a — L'environnement `aircite`

**Durée :** ≈ 30 min, dont 5 de restitution · **Module 3**, juste après la séquence 2 · individuel

Un environnement isolé pour le projet, décrit dans un fichier, dupliqué, et déclaré à
Jupyter. Deux voies, même résultat : **conda** (Anaconda, Miniconda ou Miniforge installé)
ou **venv** (Python seul). Choisissez-en une. Le TP 3b, en fin d'après-midi, s'en sert.

## Les fichiers

| Fichier | Contenu |
|---|---|
| `environment.yml` | La description conda de l'environnement `aircite` |
| `requirements.txt` | La même chose pour pip |
| `verifier_env.py` | Affiche l'interpréteur actif et les versions, signale ce qui manque |

> Les versions sont contraintes à `pandas>=2.2,<3` : la formation a été préparée sous
> pandas 2.3, et un `pip install pandas` sans contrainte installe aujourd'hui pandas 3.

## 1. Créer l'environnement `aircite`

Lancez la création **tout de suite** : elle peut prendre plusieurs minutes, et la pause
suit ce TP.

**Voie conda** (Anaconda Prompt, depuis ce dossier) :

```
conda env create -f environment.yml
conda activate aircite
```

**Voie venv** (PowerShell, depuis ce dossier) :

```
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Si PowerShell refuse `Activate.ps1` : `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`,
ou utilisez l'invite de commandes et `.venv\Scripts\activate.bat`.

Puis, dans les deux cas : `python verifier_env.py` doit finir sur « Environnement prêt »,
avec un préfixe qui contient `aircite` ou `.venv`.

## 2. L'exporter

- conda : `conda env export > env-complet.yml`, puis `conda env export --from-history > env-court.yml`.
- venv : `python -m pip freeze > requirements-fige.txt`.

Comparez le nombre de lignes des fichiers produits avec celui du fichier de départ.
Lequel donneriez-vous à un collègue sous macOS ? Lequel garantit le même résultat demain ?

> Repère, voie venv : `requirements.txt` liste 8 librairies ; le `pip freeze` qui en sort
> en liste 105 sur le poste de préparation, dépendances de JupyterLab comprises, chacune
> avec sa version exacte.

## 3. Le dupliquer

- conda : `conda create -n aircite-essai --clone aircite`, ou
  `conda env create -n aircite-essai -f env-court.yml`.
- venv : un second `python -m venv .venv-essai`, activé, puis
  `python -m pip install -r requirements-fige.txt`.

Dans la copie, changez une version (`python -m pip install "matplotlib<3.10"` par exemple),
puis relancez `verifier_env.py` dans chacun des deux : **l'original n'a pas bougé**.

## 4. Le déclarer à Jupyter

Dans l'environnement `aircite` activé :

```
python -m ipykernel install --user --name aircite --display-name "Python (aircite)"
jupyter kernelspec list
```

`aircite` doit apparaître dans la liste. On l'ouvrira dans JupyterLab au TP 3b.

## Pannes fréquentes

| Symptôme | Remède |
|---|---|
| `conda` n'est pas reconnu | Utiliser l'Anaconda Prompt, ou `conda init powershell` puis rouvrir le terminal |
| `Activate.ps1` bloqué | Politique d'exécution, voir l'étape 1 |
| L'installation échoue derrière le proxy | Le signaler au formateur : poste de secours |
| La création dure plusieurs minutes | Normal avec un antivirus : elle continue pendant la pause |
