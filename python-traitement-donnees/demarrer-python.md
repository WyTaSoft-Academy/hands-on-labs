# Démarrer avec Python, de zéro

Ce guide part de **rien** : un ordinateur sans Python. À la fin, vous aurez installé Python,
écrit et lancé vos premiers programmes, et préparé un environnement pour traiter des données.

Il est écrit pour **Windows**. Les différences pour **macOS** sont regroupées
[à la fin](#sur-macos).

Comptez **1 h** en tout. Faites les étapes **dans l'ordre**, sans en sauter : chacune vérifie
la précédente.

---

## Sommaire

1. [Ouvrir un terminal](#étape-1--ouvrir-un-terminal)
2. [Vérifier si Python est déjà là](#étape-2--vérifier-si-python-est-déjà-là)
3. [Télécharger Python](#étape-3--télécharger-python)
4. [Installer Python](#étape-4--installer-python)
5. [Vérifier l'installation](#étape-5--vérifier-linstallation)
6. [Parler à Python : le mode interactif](#étape-6--parler-à-python--le-mode-interactif)
7. [Créer un dossier de travail](#étape-7--créer-un-dossier-de-travail)
8. [Installer un éditeur : VS Code](#étape-8--installer-un-éditeur--vs-code)
9. [Votre premier script](#étape-9--votre-premier-script)
10. [Lire un message d'erreur](#étape-10--lire-un-message-derreur)
11. [Un programme qui pose une question](#étape-11--un-programme-qui-pose-une-question)
12. [Un environnement virtuel](#étape-12--un-environnement-virtuel)
13. [Installer des bibliothèques avec pip](#étape-13--installer-des-bibliothèques-avec-pip)
14. [Relier VS Code à l'environnement](#étape-14--relier-vs-code-à-lenvironnement)
15. [Jupyter, pour les données](#étape-15--jupyter-pour-les-données)
16. [Petits exercices pour s'entraîner](#étape-16--petits-exercices-pour-sentraîner)

[Dépannage](#dépannage) · [Récapitulatif des commandes](#récapitulatif-des-commandes)

---

## Étape 1 : ouvrir un terminal

Le **terminal** est une fenêtre où l'on tape des commandes au clavier. On s'en sert tout le
temps en Python : pour installer, pour lancer un programme.

1. Appuyez sur la touche **Windows** du clavier.
2. Tapez `powershell`.
3. Cliquez sur **Windows PowerShell**.

Une fenêtre s'ouvre, avec une ligne qui ressemble à :

```
PS C:\Users\votre-nom>
```

C'est l'**invite** : le terminal attend une commande. `C:\Users\votre-nom` est le
**dossier courant**, celui où vous vous trouvez.

> **À retenir.** Dans ce guide, une commande se tape **après** l'invite, puis on appuie sur
> **Entrée**. On ne tape jamais le `PS C:\...>` lui-même.

Essayez :

```
dir
```

Le terminal liste le contenu du dossier courant. Vous savez utiliser un terminal.

---

## Étape 2 : vérifier si Python est déjà là

Dans le terminal, tapez :

```
python --version
```

Trois cas possibles :

| Ce que vous voyez | Ce que ça veut dire | Que faire |
|---|---|---|
| `Python 3.12.7` (ou 3.11, 3.13…) | Python est installé, en version 3.11 ou plus | Passez à l'[étape 6](#étape-6--parler-à-python--le-mode-interactif) |
| `Python 3.8.10` (ou 3.9, 3.10) | Python est installé, mais trop ancien | Continuez à l'étape 3 |
| Le **Microsoft Store** s'ouvre, ou rien ne s'affiche | Python n'est pas installé : Windows propose de l'installer depuis le Store | Fermez le Store, continuez à l'étape 3 |
| `python n'est pas reconnu…` | Python n'est pas installé | Continuez à l'étape 3 |

> **Pourquoi pas le Microsoft Store ?** Il fonctionne, mais l'installeur officiel donne le
> même Python partout et évite des surprises de droits sur les dossiers. C'est celui que
> suivent ce guide et la formation.

---

## Étape 3 : télécharger Python

1. Ouvrez votre navigateur et allez sur **<https://www.python.org/downloads/>**.
2. La page détecte Windows et affiche un gros bouton jaune **Download Python 3.x.y**.

Quelle version ?

- Prenez une version **3.12 ou 3.13**. Elles sont stables, et toutes les bibliothèques de
  données (pandas, NumPy, Matplotlib…) les supportent.
- Si le bouton propose une version sortie **il y a moins d'un mois**, préférez la précédente :
  certaines bibliothèques mettent quelques semaines à la suivre. Les versions précédentes sont
  listées plus bas sur la même page, avec leur date.
- Pour une version précise, cliquez sur son numéro, descendez jusqu'à **Files**, et prenez
  **Windows installer (64-bit)**.

> **Selon la version**, python.org peut aussi proposer le **Python install manager**, le
> nouvel outil d'installation pour Windows. Les deux conviennent. Ce guide décrit l'installeur
> classique (**Windows installer (64-bit)**), le plus répandu.

Le fichier téléchargé s'appelle par exemple `python-3.13.1-amd64.exe`. Il est dans votre
dossier **Téléchargements**.

---

## Étape 4 : installer Python

1. Double-cliquez sur le fichier téléchargé.
2. Une fenêtre **Install Python 3.x** s'ouvre.

**Avant de cliquer sur quoi que ce soit**, regardez **en bas** de la fenêtre :

```
☑  Use admin privileges when installing py.exe
☐  Add python.exe to PATH          ← COCHEZ CETTE CASE
```

3. **Cochez « Add python.exe to PATH »**. C'est l'étape la plus importante du guide : sans
   elle, le terminal ne trouvera pas Python.
4. Cliquez sur **Install Now** (en haut).
5. Windows demande « Voulez-vous autoriser cette application à apporter des modifications ? » :
   répondez **Oui**.
6. Attendez la barre de progression (1 à 2 minutes).
7. L'écran **Setup was successful** s'affiche. S'il propose **Disable path length limit**,
   cliquez dessus (puis **Oui**) : cela évite des erreurs avec les chemins très longs.
8. Cliquez sur **Close**.

> **Vous avez oublié la case PATH ?** Relancez le même fichier `.exe`, choisissez **Modify**,
> puis **Next**, cochez **Add Python to environment variables**, et **Install**.

---

## Étape 5 : vérifier l'installation

**Fermez** le terminal PowerShell, et **rouvrez-en un nouveau** (étape 1). C'est obligatoire :
un terminal ouvert avant l'installation ne connaît pas encore Python.

Tapez :

```
python --version
```

Vous devez voir :

```
Python 3.13.1
```

(avec votre numéro de version). Puis :

```
python -m pip --version
```

Vous devez voir une ligne qui commence par `pip 24…` ou plus, et qui finit par
`(python 3.13)`. **pip** est l'outil qui installe les bibliothèques ; il est livré avec Python.

Si l'une des deux commandes échoue, voyez le [dépannage](#dépannage) avant d'aller plus loin.

---

## Étape 6 : parler à Python, le mode interactif

Dans le terminal, tapez simplement :

```
python
```

L'invite change :

```
Python 3.13.1 (tags/v3.13.1…) on win32
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

Les trois chevrons `>>>` signifient : **Python vous écoute**. Ce que vous tapez maintenant
est du Python, pas une commande du terminal.

Tapez chaque ligne, puis **Entrée**, et regardez la réponse :

```python
>>> 2 + 3
5
>>> 10 / 4
2.5
>>> 7 // 2
3
>>> 2 ** 10
1024
>>> "Bonjour"
'Bonjour'
>>> "Bon" + "jour"
'Bonjour'
>>> "ha" * 3
'hahaha'
```

Ce que vous venez de voir :

| Écriture | Signification |
|---|---|
| `+ - *` | addition, soustraction, multiplication |
| `/` | division, qui donne toujours un nombre à virgule |
| `//` | division entière |
| `**` | puissance |
| `"..."` | du **texte** (une *chaîne de caractères*) |

Maintenant, une **variable** : un nom qui retient une valeur.

```python
>>> age = 30
>>> age
30
>>> age + 1
31
>>> prenom = "Lina"
>>> print("Bonjour", prenom)
Bonjour Lina
```

`print(...)` affiche ce qu'on lui donne. On s'en servira dans tous les scripts.

Pour **quitter** le mode interactif :

```python
>>> exit()
```

L'invite `PS C:\...>` revient : vous êtes de nouveau dans le terminal.

> **À retenir.** `>>>` : vous parlez à Python. `PS C:\...>` : vous parlez au terminal. Taper
> `python --version` après `>>>` donne une erreur, et c'est normal.

---

## Étape 7 : créer un dossier de travail

Le mode interactif oublie tout quand on le quitte. Pour garder son code, on l'écrit dans des
**fichiers**, rangés dans un dossier à soi.

Dans le terminal :

```
cd ~\Documents
mkdir python-debut
cd python-debut
```

- `cd` (*change directory*) : aller dans un dossier. `~` est votre dossier personnel.
- `mkdir` (*make directory*) : créer un dossier.

L'invite indique maintenant :

```
PS C:\Users\votre-nom\Documents\python-debut>
```

Vous êtes dans votre dossier de travail. Toutes les étapes suivantes s'y passent.

---

## Étape 8 : installer un éditeur, VS Code

On pourrait écrire du Python dans le Bloc-notes, mais un **éditeur de code** colore la
syntaxe, signale les erreurs et lance le programme d'un clic.

1. Allez sur **<https://code.visualstudio.com/>** et cliquez sur **Download for Windows**.
2. Lancez le fichier téléchargé. Acceptez la licence, puis, sur l'écran **Tâches
   supplémentaires**, cochez :
   - **Ajouter l'action « Ouvrir avec Code » au menu contextuel des dossiers** ;
   - **Ajouter à PATH** (normalement déjà coché).
3. **Installer**, puis **Terminer**.

Ajoutez le support de Python :

4. Dans VS Code, cliquez sur l'icône **Extensions** dans la barre de gauche (quatre petits
   carrés), ou faites `Ctrl+Maj+X`.
5. Tapez `python` dans la recherche.
6. Choisissez **Python**, éditeur **Microsoft** (le badge bleu de vérification), puis
   **Install**.

Ouvrez votre dossier de travail :

7. Menu **Fichier > Ouvrir le dossier…**, choisissez `Documents\python-debut`, puis
   **Sélectionner un dossier**.
8. Si VS Code demande « Faites-vous confiance aux auteurs des fichiers de ce dossier ? »,
   répondez **Oui** : c'est votre dossier.

> **Pas envie d'installer VS Code tout de suite ?** Python est livré avec un petit éditeur,
> **IDLE** : touche Windows, tapez `idle`. Menu **File > New File** pour écrire un script,
> **F5** pour le lancer. Il suffit pour les étapes 9 à 11.

---

## Étape 9 : votre premier script

1. Dans VS Code, menu **Fichier > Nouveau fichier texte**.
2. Enregistrez-le tout de suite (`Ctrl+S`) sous le nom **`bonjour.py`**, dans `python-debut`.
   L'extension `.py` dit à VS Code que c'est du Python : la coloration apparaît.
3. Tapez :

```python
# Mon premier programme
print("Bonjour !")

nom = "Air'Cité"
capteurs = 12
print("Le réseau", nom, "compte", capteurs, "capteurs.")
print(f"Soit {capteurs * 24} mesures par jour, à une mesure par heure.")
```

4. Enregistrez (`Ctrl+S`).

Ce qu'il faut comprendre :

- La ligne qui commence par `#` est un **commentaire** : Python l'ignore. Il sert aux humains.
- Python exécute les lignes **de haut en bas**, une par une.
- `f"..."` est une **f-string** : ce qui est entre accolades `{ }` est calculé et inséré dans
  le texte.

**Lancer le script, première façon : le bouton.** Cliquez sur le triangle ▷ en haut à droite
de VS Code. Un terminal s'ouvre en bas et affiche :

```
Bonjour !
Le réseau Air'Cité compte 12 capteurs.
Soit 288 mesures par jour, à une mesure par heure.
```

**Deuxième façon : le terminal.** C'est celle qu'il faut connaître, car elle marche partout.
Dans VS Code, menu **Terminal > Nouveau terminal**, puis :

```
python bonjour.py
```

Même résultat. La commande veut dire : « Python, exécute le fichier `bonjour.py` du dossier
courant ».

> **À retenir.** `python fichier.py` cherche le fichier **dans le dossier courant**. Si vous
> obtenez `can't open file … No such file or directory`, vous n'êtes pas dans le bon dossier :
> vérifiez l'invite, et faites `cd` vers le dossier du fichier.

---

## Étape 10 : lire un message d'erreur

Les erreurs font partie du travail : un développeur expérimenté en voit des dizaines par jour.
L'important est de **les lire**.

Créez **`erreur.py`** :

```python
temperature = 21
print("Il fait " + temperature + " degrés")
```

Lancez-le : `python erreur.py`. Python affiche :

```
Traceback (most recent call last):
  File "C:\Users\votre-nom\Documents\python-debut\erreur.py", line 2, in <module>
    print("Il fait " + temperature + " degrés")
          ~~~~~~~~~~~^~~~~~~~~~~~~
TypeError: can only concatenate str (not "int") to str
```

**Lisez de bas en haut :**

1. **La dernière ligne dit quoi** : `TypeError`, on ne peut coller (*concatenate*) que du texte
   (`str`) à du texte, pas un nombre (`int`).
2. **Au-dessus, elle dit où** : fichier `erreur.py`, **ligne 2**, et les `~~~^~~~` montrent
   l'endroit exact.

La correction : convertir le nombre en texte, ou laisser une f-string le faire.

```python
temperature = 21
print("Il fait " + str(temperature) + " degrés")
print(f"Il fait {temperature} degrés")
```

Les erreurs que vous croiserez le plus au début :

| Erreur | Cause habituelle |
|---|---|
| `SyntaxError` | Une parenthèse ou un guillemet oublié, un `:` manquant |
| `IndentationError` | Les espaces en début de ligne ne sont pas alignés |
| `NameError: name 'x' is not defined` | Une faute de frappe dans un nom, ou une variable utilisée avant d'être créée |
| `TypeError` | Une opération entre deux types incompatibles, comme texte + nombre |
| `FileNotFoundError` | Le fichier n'est pas dans le dossier courant |

---

## Étape 11 : un programme qui pose une question

Créez **`niveau.py`** :

```python
# Classe une mesure de NO2 (en µg/m³) par rapport au seuil de 40
texte = input("Mesure de NO2 : ")
mesure = float(texte)

if mesure > 40:
    print("Au-dessus du seuil")
elif mesure > 30:
    print("Proche du seuil")
else:
    print("Correct")

print("Fin de l'analyse.")
```

Lancez-le : `python niveau.py`. Le programme **attend** : tapez `45` puis **Entrée**.
Relancez avec `35`, puis `12`.

Trois nouveautés :

- `input("...")` affiche la question et **attend** ce que vous tapez. Il rend toujours du
  **texte**, même si vous tapez un nombre.
- `float(texte)` convertit ce texte en nombre à virgule. Essayez de taper `abc` : vous
  obtenez une `ValueError`, que vous savez maintenant lire.
- `if` / `elif` / `else` : Python teste les conditions dans l'ordre, et exécute **seulement**
  le premier bloc dont la condition est vraie.

**L'indentation compte.** Les lignes décalées de 4 espaces sous un `if` forment son bloc.
`print("Fin de l'analyse.")`, qui n'est pas décalée, s'exécute dans tous les cas. VS Code
insère les 4 espaces quand vous appuyez sur **Tab** ou après un `:` suivi d'**Entrée**.

Une **boucle**, pour finir. Créez **`boucle.py`** :

```python
mesures = [38.7, 41.2, 45.0, 52.1, 39.0]

for m in mesures:
    if m > 40:
        print(m, "dépasse le seuil")

print("Nombre de mesures :", len(mesures))
print("Moyenne :", round(sum(mesures) / len(mesures), 1))
```

- `[ ... ]` est une **liste** : plusieurs valeurs dans une seule variable.
- `for m in mesures:` prend chaque valeur de la liste, une à une, et exécute le bloc décalé.
- `len`, `sum` et `round` sont des **fonctions** livrées avec Python.

Vous avez vu l'essentiel pour écrire de petits programmes. La suite prépare le travail sur
les données.

---

## Étape 12 : un environnement virtuel

Pour traiter des données, on installe des **bibliothèques** (pandas, Matplotlib…). Plutôt que
de les installer dans le Python de l'ordinateur, on crée un **environnement virtuel** : un
Python à part, propre à un projet, qu'on peut supprimer sans risque.

Dans le terminal de VS Code, depuis `python-debut` :

```
python -m venv .venv
```

Rien ne s'affiche pendant quelques secondes : c'est normal. Un dossier **`.venv`** apparaît
dans l'explorateur de VS Code. Il contient une copie de Python. **N'y écrivez jamais vos
fichiers** : votre code reste à côté, dans `python-debut`.

**Activez** l'environnement :

```
.venv\Scripts\Activate.ps1
```

L'invite commence maintenant par `(.venv)` :

```
(.venv) PS C:\Users\votre-nom\Documents\python-debut>
```

Tant que vous voyez `(.venv)`, les commandes `python` et `pip` utilisent l'environnement du
projet.

> **Erreur « l'exécution de scripts est désactivée sur ce système » ?** C'est une protection
> de PowerShell. Tapez une seule fois, pour votre compte :
>
> ```
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
> ```
>
> répondez `O` (ou `Y`), puis relancez l'activation.

Pour en sortir plus tard : `deactivate`. Chaque nouveau terminal démarre **sans**
environnement actif : il faut le réactiver.

---

## Étape 13 : installer des bibliothèques avec pip

L'environnement actif (`(.venv)` au début de l'invite), mettez d'abord pip à jour :

```
python -m pip install --upgrade pip
```

Puis installez les bibliothèques de données :

```
python -m pip install "pandas>=2.2,<3" matplotlib jupyterlab ipykernel
```

pip télécharge et installe : comptez 1 à 3 minutes. La dernière ligne doit commencer par
`Successfully installed`.

> **Pourquoi `"pandas>=2.2,<3"` ?** Ça demande une version 2 de pandas, à partir de la 2.2.
> La version 3 change certains comportements : la formation est préparée avec pandas 2.
> Les guillemets sont obligatoires, à cause des signes `<` et `>`.

Vérifiez dans le mode interactif :

```
python
```

```python
>>> import pandas as pd
>>> pd.__version__
'2.3.3'
>>> df = pd.DataFrame({"capteur": ["AQ-01", "AQ-02"], "no2": [41.2, 33.5]})
>>> df
  capteur   no2
0   AQ-01  41.2
1   AQ-02  33.5
>>> df["no2"].mean()
np.float64(37.35)
>>> exit()
```

`import` charge une bibliothèque ; `as pd` lui donne un nom court, la convention habituelle.
Si `import pandas` donne `ModuleNotFoundError`, l'environnement n'était pas actif au moment de
l'installation : voyez le [dépannage](#dépannage).

---

## Étape 14 : relier VS Code à l'environnement

VS Code doit savoir quel Python utiliser pour le bouton ▷.

1. Ouvrez un fichier `.py`, par exemple `bonjour.py`.
2. Faites `Ctrl+Maj+P`, tapez `Python: Select Interpreter`, puis **Entrée**.
3. Choisissez la ligne qui contient **`.venv`** (souvent marquée *Recommended*).

En bas à droite de VS Code, la barre d'état affiche la version de Python et `('.venv')`.
Désormais, le bouton ▷ et les nouveaux terminaux de VS Code utilisent l'environnement.

Testez avec **`donnees.py`** :

```python
import pandas as pd

df = pd.DataFrame({
    "capteur": ["AQ-01", "AQ-02", "AQ-03", "AQ-04"],
    "quartier": ["Centre", "Centre", "Centre", "Gare"],
    "no2": [41.2, 33.5, 47.0, 28.9],
})

print(df)
print()
print("NO2 moyen par quartier :")
print(df.groupby("quartier")["no2"].mean())
```

▷ doit afficher le tableau, puis la moyenne par quartier : `Centre 40.566667` et
`Gare 28.900000`.

---

## Étape 15 : Jupyter, pour les données

Un **notebook Jupyter** mélange du code, son résultat (tableaux, graphiques) et du texte,
dans des **cellules** qu'on exécute une à une. C'est l'outil habituel pour explorer des données.

Dans VS Code :

1. `Ctrl+Maj+P`, tapez `Create: New Jupyter Notebook`, **Entrée**.
2. En haut à droite, cliquez sur **Select Kernel**, puis **Python Environments**, puis
   l'environnement **`.venv`**.
3. Dans la première cellule, tapez :

```python
import pandas as pd
import matplotlib.pyplot as plt

heures = list(range(24))
no2 = [18, 15, 13, 12, 13, 17, 28, 42, 48, 39, 33, 31,
       30, 29, 31, 35, 41, 46, 44, 36, 29, 25, 22, 20]

plt.plot(heures, no2, marker="o")
plt.axhline(40, color="red", linestyle="--", label="seuil")
plt.xlabel("Heure")
plt.ylabel("NO2 (µg/m³)")
plt.legend()
plt.show()
```

4. Exécutez la cellule avec **`Maj+Entrée`**. Le graphique s'affiche sous la cellule : deux
   pics, le matin et le soir, aux heures de pointe.
5. Enregistrez (`Ctrl+S`) sous `premier-notebook.ipynb`.

> **Sans VS Code**, Jupyter s'ouvre aussi dans le navigateur : environnement actif, tapez
> `jupyter lab`. Pour l'arrêter, revenez au terminal et faites `Ctrl+C`.

---

## Étape 16 : petits exercices pour s'entraîner

Un fichier par exercice, dans `python-debut`. Lancez-les avec `python nom.py`.

1. **Conversion.** Demandez une température en degrés Celsius avec `input`, affichez-la en
   Fahrenheit : `f = c * 9 / 5 + 32`. *Contrôle : 20 °C donne 68.0 °F.*
2. **Pair ou impair.** Demandez un nombre entier (`int(...)`) et dites s'il est pair.
   *Indice : `n % 2` donne le reste de la division par 2.*
3. **Table de multiplication.** Affichez la table de 7, de `7 x 1 = 7` à `7 x 10 = 70`.
   *Indice : `for i in range(1, 11):`.*
4. **Le maximum.** Avec `mesures = [38.7, 41.2, 45.0, 52.1, 39.0]`, trouvez la plus grande
   valeur **sans** utiliser `max` : une variable `plus_grande`, une boucle, un `if`.
   *Contrôle : 52.1.*
5. **Compter.** Avec la même liste, comptez les mesures au-dessus de 40. *Contrôle : 3.*

Bloqué ? Relisez la **dernière ligne** de l'erreur, puis le numéro de ligne au-dessus. Ajouter
des `print(...)` pour voir la valeur d'une variable est la technique de débogage la plus
utilisée au monde.

---

## Sur macOS

Les étapes sont les mêmes, avec ces différences :

| Étape | Sur macOS |
|---|---|
| 1. Terminal | `Cmd+Espace`, tapez `Terminal`. L'invite finit par `%` au lieu de `>` |
| 2 et 5. Vérifier | Tapez **`python3`** au lieu de `python` : `python3 --version` |
| 3. Télécharger | Sur python.org, prenez le **macOS 64-bit universal2 installer** (`.pkg`) |
| 4. Installer | Double-cliquez sur le `.pkg` et suivez l'assistant ; pas de case PATH à cocher. À la fin, lancez **Install Certificates.command** dans le dossier `Applications/Python 3.x` qui s'ouvre |
| 7. Dossier | `cd ~/Documents`, puis `mkdir python-debut`, `cd python-debut` (barres `/`) |
| 9. Lancer | `python3 bonjour.py` |
| 12. Activer | `python3 -m venv .venv`, puis **`source .venv/bin/activate`**. Une fois actif, `python` suffit |
| Raccourcis | `Cmd` à la place de `Ctrl` |

---

## Dépannage

| Symptôme | Cause | Solution |
|---|---|---|
| `python` ouvre le **Microsoft Store** | Les « alias d'exécution » de Windows passent avant le vrai Python | Paramètres > Applications > Paramètres avancés des applications > **Alias d'exécution d'application** : désactivez **python.exe** et **python3.exe**. Rouvrez le terminal |
| `python n'est pas reconnu…` après l'installation | La case PATH n'a pas été cochée, ou le terminal date d'avant l'installation | Fermez et rouvrez le terminal. Sinon, essayez `py --version` : si ça marche, utilisez `py` à la place de `python`, ou refaites l'étape 4 avec **Modify** |
| `python --version` affiche une **ancienne** version | Un autre Python, plus ancien, passe en premier | `py -0` liste les Python installés ; `py -3.13` lance la bonne version. Pour l'environnement : `py -3.13 -m venv .venv` |
| `can't open file … No such file or directory` | Le terminal n'est pas dans le dossier du fichier | Regardez l'invite, faites `cd` vers le bon dossier, `dir` pour vérifier que le fichier y est |
| `ModuleNotFoundError: No module named 'pandas'` | La bibliothèque est installée dans un autre Python que celui qui exécute | Activez l'environnement (`(.venv)` dans l'invite) et réinstallez avec `python -m pip install …`. Dans VS Code, refaites l'étape 14 |
| `l'exécution de scripts est désactivée` | Protection de PowerShell | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, ou utilisez l'invite de commandes (`cmd`) et `.venv\Scripts\activate.bat` |
| `Permission denied` en recréant `.venv` | Un programme (VS Code, un notebook) utilise encore ce Python | Fermez les notebooks ouverts ou VS Code, puis recommencez |
| `IndentationError` | Espaces et tabulations mélangés, ou bloc mal aligné | Dans VS Code, sélectionnez tout et `Maj+Tab` / `Tab` pour réaligner ; 4 espaces par niveau |
| Le programme ne s'arrête plus | Une boucle infinie, ou un `input` qui attend | `Ctrl+C` dans le terminal |

---

## Récapitulatif des commandes

| Commande (Windows) | Rôle |
|---|---|
| `python --version` | Afficher la version de Python |
| `python` · `exit()` | Entrer dans le mode interactif · en sortir |
| `cd dossier` · `cd ..` · `dir` | Aller dans un dossier · remonter d'un niveau · lister |
| `mkdir dossier` | Créer un dossier |
| `python fichier.py` | Exécuter un script |
| `python -m venv .venv` | Créer un environnement virtuel |
| `.venv\Scripts\Activate.ps1` · `deactivate` | L'activer · le désactiver |
| `python -m pip install nom` | Installer une bibliothèque dans l'environnement actif |
| `python -m pip list` | Lister les bibliothèques installées |
| `jupyter lab` | Ouvrir Jupyter dans le navigateur |
| `Ctrl+C` | Arrêter le programme en cours |

**Pour aller plus loin :** le tutoriel officiel, en français,
<https://docs.python.org/fr/3/tutorial/>.
