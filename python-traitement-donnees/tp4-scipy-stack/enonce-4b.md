# TP 4b — Les statistiques d'Air'Cité

**Durée :** ≈ 45 min, dont 5 de restitution · **Module 4, après-midi** · individuel

On exploite enfin le CSV produit au TP 2b. Votre `mesures.csv`
(`../tp2b-logs-sqlite-csv/mesures.csv`), ou la copie de référence `../donnees/mesures.csv` :
c'est le même fichier. La base des capteurs est `../donnees/capteurs.db`.

Fichiers : `depart-4b.ipynb` (à compléter) ; le corrigé est présenté en restitution.

## Étapes

1. **Lire et contrôler.** `read_csv` avec `parse_dates=["horodatage"]`, puis `shape`,
   `info()`, et le nombre de trous de NO2 par capteur.
2. **Interpoler capteur par capteur.** Comptez avant, comblez, comptez après, et écrivez
   le nombre de valeurs remplacées. La ligne qui bloque le plus :
   `m["no2"] = m.groupby("capteur")["no2"].transform(lambda s: s.interpolate())`.
   Il reste un trou : lequel, et pourquoi ? `interpolate(limit_direction="both")` le comble.
   Bloqué ? Le détail pas à pas : [`interpoler-par-capteur.md`](interpoler-par-capteur.md).
3. **Classer.** NO2 moyen et maximum par quartier, triés ; puis par capteur avec son nom,
   en joignant la table `capteurs` (`pd.read_sql` + `merge`). Vérifiez que la jointure
   garde 8 064 lignes.
4. **Le profil journalier.** Colonne `heure`, `pivot_table` heure × quartier, tracé avec
   titre et unités, enregistré dans `profil.png`.
5. **Semaine et week-end.** Le tableau quartier × type de jour, la baisse en %, un graphique
   en barres groupées (`semaine.png`).

## Le livrable

Deux figures, `profil.png` et `semaine.png`, et trois chiffres à annoncer.

> Vérification : 151 trous, 150 comblés par `interpolate()`, le dernier (AQ-01, la toute
> première heure) par `limit_direction="both"` ; **Centre** le plus exposé (29,0 µg/m³,
> Gare juste derrière à 28,4) ; pointe à **8 h** ; baisse du week-end de **16 à 17 %**
> selon le quartier. Capteur le plus exposé : AQ-03, Rue Neuve (31,6).

## Bonus 1

Moyennes journalières par capteur (`resample("D")`), exportées dans un classeur Excel,
un onglet par quartier (`pd.ExcelWriter`).

## Bonus 2 — Les mêmes questions en SQL, avec DuckDB

≈ 15 min. DuckDB exécute du SQL sur un fichier CSV ou Parquet, ou sur un DataFrame
en mémoire, sans serveur ni chargement préalable. Il est installé avec l'environnement
du TP 3a ; sinon, `%pip install duckdb` dans le notebook.

1. **Sur le fichier.** `duckdb.sql(...)` avec `FROM '../donnees/mesures.csv'` : le NO2 moyen et
   maximum par quartier, triés, avec `count(*)` et `count(no2)`. Pourquoi ces deux comptes
   diffèrent-ils, et que fait `avg` des cellules vides ?
2. **Sur le DataFrame.** La même requête `FROM m`, le DataFrame interpolé : DuckDB le trouve
   par son nom de variable. `.df()` rend un DataFrame pandas : comparez-le au classement de
   l'étape 3. Un quartier a changé d'un dixième : lequel, et pourquoi ?
3. **La jointure.** `m JOIN cap ON m.capteur = cap.id` : les trois capteurs les plus exposés,
   avec leur nom.
4. **Semaine et week-end.** En une requête : `isodow(horodatage)` (1 = lundi, 7 = dimanche) et
   `avg(no2) FILTER (WHERE ...)`. Retrouvez la baisse de l'étape 5.

> Vérification : sur le fichier, 2 016 lignes par quartier mais 1 975 à 1 986 mesures ;
> `avg` ignore les vides, comme `mean()`. Centre 29,0, Gare 28,4, Port 21,4, Université 13,0
> sur le fichier brut, **12,9** après interpolation, comme à l'étape 3. Le podium :
> AQ-03 Rue Neuve (31,6), AQ-05 Boulevard Ferroviaire (30,3), AQ-04 Parvis de la Gare (28,8).
> Baisse du week-end : 15,9 % (Gare) à 17,0 % (Centre), les chiffres de l'étape 5.

À retenir : pandas et SQL répondent à la même question, de deux façons. DuckDB est utile
quand le fichier est trop gros pour la mémoire, ou quand l'équipe pense déjà en SQL.
