# TP 3 : le catalog de la Banque Lumen

**Module 4 · ≈ 1 h 30 · individuel, puis en binôme · restitution 10 min**

Au TP 1, vous avez lu les fichiers bruts de la Banque Lumen sans rien créer. Ils entrent maintenant
dans **votre catalog** : un catalog à vous, trois schemas, les tables de la couche **bronze**, une
view partagée avec votre voisin, et la table des agences, qui vit dans une base **Azure SQL**.

Tout se fait dans le **SQL editor**, sur le SQL warehouse `wh-dki-formation`.

Remplacez partout :

| Dans l'énoncé | Par |
|---|---|
| `stagiaire01` | votre compte |
| `stagiaire02` | le compte de votre binôme |
| `<stockage>` | le nom du storage account (donné dans le chat) |
| `<domaine>` | le domaine des comptes de formation (donné dans le chat) |

La bronze garde les données **telles qu'elles sont arrivées** : on ne corrige aucun défaut dans ce
TP. Le seul écart permis est de lire le code postal comme du texte, pour ne pas perdre ses zéros.

---

## Partie A · La préparation (démonstration, ≈ 10 min)

Le formateur montre ce qui a été préparé avant la session. Notez les réponses :

1. Quel **container** du storage account accueillera les fichiers de vos managed tables, et quelle
   **external location** le couvre ?
2. Quel privilege avez-vous sur cette external location, et quel privilege sur le **metastore** ?
3. Quelle **connection** mène à Azure SQL ? Quel utilisateur SQL utilise-t-elle, avec quels droits
   dans la base ? Voyez-vous son mot de passe ?

---

## Partie B · À vous

### Étape 1 · Le catalog et ses schemas (≈ 10 min)

Créez le catalog `lumen_stagiaire01`, avec le managed location
`abfss://formation@<stockage>.dfs.core.windows.net/catalogs/stagiaire01` et un commentaire. Puis trois schemas :
`bronze`, `silver`, `gold`.

Vérifiez dans le **Catalog Explorer** : votre catalog apparaît, avec ses trois schemas. Qui en est
l'**owner** ?

### Étape 2 · Les tables bronze (≈ 20 min)

1. `bronze.clients`, par un `CREATE OR REPLACE TABLE … AS SELECT` sur `read_files` : la lecture
   corrigée du TP 1 (`header`, `sep`, et `schemaHints` pour le code postal). Ajoutez un commentaire
   de table.
2. `bronze.transactions`, de la même façon, à partir du **dossier** `transactions/`.
3. `bronze.comptes`, par **`COPY INTO`** : créez d'abord la table sans colonnes
   (`CREATE TABLE IF NOT EXISTS …;`), puis chargez `comptes.csv` avec les options
   `header`, `sep`, `inferSchema` et `mergeSchema`. Lisez le résultat de la commande.
4. **Relancez** exactement le même `COPY INTO`. Combien de lignes sont chargées cette fois ?
   Pourquoi ?
5. Comptez les lignes des trois tables.

### Étape 3 · Décrire (≈ 5 min)

1. `DESCRIBE EXTENDED` sur `bronze.clients` : quel est son **type** ? Où sont ses fichiers
   (`Location`) ? Le chemin est-il celui que vous avez choisi ?
2. Ajoutez un commentaire sur la colonne `email` : *Donnée personnelle*.
3. Quelle colonne de `bronze.clients` ne vient pas du fichier ? Que contient-elle ?

### Étape 4 · Les privileges, en binôme (≈ 15 min)

Votre binôme doit pouvoir lire les clients de **votre** Banque Lumen, mais pas leurs données
personnelles (nom, prénom, e-mail, date de naissance), et rien d'autre de votre catalog.

1. Créez la view `gold.v_clients` : une ligne par client (`DISTINCT`), avec `client_id`,
   `segment`, `agence_id`, `ville`, `code_postal`.
2. Donnez à votre binôme **seulement** `SELECT` sur la view. Demandez-lui de la lire. Que se
   passe-t-il ?
3. Ajoutez ce qui manque, au plus juste. Votre binôme relit la view : combien de lignes ?
4. Votre binôme essaie de lire `lumen_stagiaire01.bronze.clients`. Que se passe-t-il ?
5. `SHOW GRANTS` sur la view, puis sur le catalog. Ouvrez aussi l'onglet *Permissions* et
   l'onglet *Lineage* de la view dans le Catalog Explorer.

### Étape 5 · Azure SQL, par Lakehouse Federation (≈ 20 min)

1. Créez le foreign catalog `lumen_sql_stagiaire01`, sur la connection `conn_sqldb_dki`, base
   `lumen`. Dans le Catalog Explorer, quels schemas et quelles tables y voyez-vous ?
2. Combien d'agences, et dans combien de **régions** ?
3. Le nombre de **clients distincts par région** : une jointure entre votre `bronze.clients` et
   la table `agences` d'Azure SQL, dans une seule requête.

   **3b.** Le nombre de **clients distincts par agence**, dans votre `bronze.clients` : quelle
   agence en a le plus ? Combien d'agences n'en ont qu'un ?
4. Copiez les agences dans votre catalog : `bronze.agences`, par `CREATE TABLE … AS SELECT`. Pourquoi
   copier, alors qu'on peut les lire sur place ?

### Bonus

1. **`DROP` et `UNDROP`.** Supprimez `bronze.comptes`, vérifiez qu'elle a disparu, puis
   `UNDROP TABLE`. Combien de lignes a-t-elle ?
2. **Un volume, et un fichier du poste.** Créez le volume managed `bronze.depots`. Sur votre poste,
   créez un fichier `segments.csv` avec un éditeur de texte :
   ```
   segment;libelle
   PARTICULIER;Particulier
   PATRIMONIAL;Banque patrimoniale
   PROFESSIONNEL;Professionnel
   ```
   Déposez-le dans le volume (Catalog Explorer → le volume → *Upload to this volume*), puis lisez-le
   avec `read_files` sur son chemin `/Volumes/…`.
3. **`information_schema`.** Listez les tables de votre catalog, avec leur type, en interrogeant
   `lumen_stagiaire01.information_schema.tables`.

---

## Ce qu'on attend en fin de TP

| Mesure | Votre résultat |
|---|---|
| Lignes de `bronze.clients` / `comptes` / `transactions` | |
| Lignes chargées par le deuxième `COPY INTO` | |
| Votre binôme lit `gold.v_clients` ? `bronze.clients` ? | |
| Agences / régions dans Azure SQL | |
| Clients distincts en Île-de-France / en Bretagne | |
| L'agence qui a le plus de clients ; combien d'agences n'en ont qu'un | |

Ne supprimez rien en partant : le TP 4 part de vos tables bronze.
