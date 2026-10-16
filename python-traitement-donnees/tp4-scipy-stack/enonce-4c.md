# TP 4c — La carte et le spectre

**Durée :** ≈ 35 min, dont 5 de restitution · **Module 4, après-midi** · individuel

Le dernier TP réutilise tout : pandas pour préparer, NumPy pour convertir, SciPy pour
calculer, Matplotlib pour montrer. La première cellule de `depart-4c.ipynb` reconstruit le
DataFrame interpolé du TP 4b.

Fichiers : `depart-4c.ipynb` (à compléter), `corrige-4c.ipynb` (projeté en restitution).
Si le temps presse, faites les étapes 2 et 4 : ce sont les deux livrables visibles.

## Étapes

1. **Tester le week-end.** Test t de Welch, semaine contre week-end
   (`stats.ttest_ind(a, b, equal_var=False)`), sur la ville puis quartier par quartier.
   La baisse est-elle partout significative ?
2. **La carte.** Les capteurs en lon/lat ; taille = NO2 moyen, couleur = quartier,
   identifiants en étiquettes ; `ax.set_aspect(1 / np.cos(np.radians(45.765)))` pour
   qu'un kilomètre ait la même longueur dans les deux sens. `carte.png`.
3. **Le plus proche.** Convertissez en kilomètres (`111.32 * cos(latitude)` km par degré de
   longitude, `110.57` par degré de latitude), construisez un `KDTree`, et trouvez le
   capteur le plus proche de chaque adresse :

   | Adresse (fictive) | Latitude | Longitude |
   |---|---|---|
   | École Jean-Moulin | 45.7620 | 4.8450 |
   | Crèche des Docks | 45.7495 | 4.8290 |
   | Gymnase du Campus | 45.7820 | 4.8600 |

4. **Le spectre.** La série de la ville (moyenne des capteurs par heure), **centrée** ;
   `fft.rfft`, `fft.rfftfreq(len(y), d=1)` ; les cinq périodes dominantes ; le tracé
   amplitude en fonction de la période, en échelle log. `spectre.png`.

## Le livrable

`carte.png`, `spectre.png`, et une phrase : « le NO2 d'Air'Cité suit … ».

> Vérification : la baisse du week-end est significative partout (p < 10⁻¹⁵ dans chaque
> quartier) ; École Jean-Moulin → AQ-02 Place des Halles, 0,65 km ; Crèche des Docks →
> AQ-07 Quai des Docks, 0,23 km ; Gymnase du Campus → AQ-11 Bibliothèque, 0,32 km ;
> périodes dominantes 12 h, 8 h, 24 h, 4,8 h et 6 h : un cycle de 24 h à deux pointes et
> ses harmoniques. Le rythme hebdomadaire (168 h) est visible, plus faible.

## Erreurs fréquentes

- Oublier de centrer la série : le pic de fréquence nulle écrase tout le graphique.
- Lancer la FFT sur une série avec des `NaN` : le résultat est entièrement `nan`.

## Bonus

Le spectre d'un seul capteur après interpolation ; celui de la température : un seul pic
net à 24 h, sans harmoniques. Les valeurs à très longue période (672 h, 336 h) traduisent
le réchauffement progressif du mois : une tendance, pas un rythme.
