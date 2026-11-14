# TP 1 : un workspace, et les fichiers bruts de la Banque Lumen

**Module 2 · ≈ 50 min · individuel · restitution 10 min**

La Banque Lumen (fictive) vous confie son projet de lakehouse. Avant de construire quoi que ce
soit, il faut savoir **ce qu'elle a déposé** dans son data lake, et **dans quel état**. C'est
l'objet de ce TP : se connecter aux fichiers bruts, les lire sans rien créer, et dresser la liste
des défauts que les TP suivants devront traiter.

Tout se fait dans le **SQL editor**, sur le **SQL warehouse partagé** : la création d'un cluster
est le TP 2.

Dans les requêtes, remplacez `<stockage>` par le nom du storage account donné par le formateur.
Le chemin de base est :

```
abfss://formation@<stockage>.dfs.core.windows.net/banque/
```

---

## Partie A · Le workspace et sa connexion à ADLS (visite commentée, ≈ 15 min)

Le formateur montre ce qui a été préparé avant la session : le workspace dans le portail Azure, l'Access
Connector et son rôle sur le storage account, puis, dans Unity Catalog, le storage credential et
l'external location. Pendant la visite, notez la réponse à ces quatre questions :

1. Combien de **resource groups** existent après la création du workspace, et lequel contient
   les machines des clusters ?
2. Quel **pricing tier** est choisi, Premium ou Trial, et pourquoi Premium ?
3. Quelle ressource Azure porte l'**identité** qui lira le storage account ? Quel **rôle** lui
   donne-t-on, et sur quoi ?
4. Dans Unity Catalog, quels sont les **deux objets** créés pour autoriser ce chemin
   `abfss://`, et dans quel ordre ?

---

## Partie B · Explorer et lire (≈ 25 min)

### Étape 1 · Trouver l'external location

Dans le **Catalog Explorer** : *External data* → *External locations* → `ext_dki_formation`.

- Relevez son URL et le storage credential qu'elle utilise.
- Onglet *Permissions* : quel privilege avez-vous dessus ?

### Étape 2 · Lister les fichiers

```sql
LIST 'abfss://formation@<stockage>.dfs.core.windows.net/banque/';
```

Puis listez le dossier `transactions/`. **Attendu** : deux CSV (`clients.csv`, `comptes.csv`),
deux dossiers (`transactions/`, `arrivees/`), et six fichiers Parquet, un par mois de janvier à
juin 2026.

### Étape 3 · Lire `clients.csv`, mal puis bien

Lisez le fichier **sans aucune option** :

```sql
SELECT * FROM read_files(
  'abfss://formation@<stockage>.dfs.core.windows.net/banque/clients.csv',
  format => 'csv')
LIMIT 5;
```

Que voyez-vous, et pourquoi ? Imaginez le fichier ouvert dans un tableur : c'est un export « à la
française ». Corrigez avec les options `header` et `sep`.

### Étape 4 · Compter les clients

Sur la lecture corrigée, calculez en une requête :

- le nombre de **lignes** ;
- le nombre de **clients distincts** (`client_id`) ;
- le nombre de clients **sans e-mail**.

Puis regardez les **types** déduits par `read_files` :

```sql
DESCRIBE QUERY
SELECT * FROM read_files('…/clients.csv', format => 'csv', header => true, sep => ';');
```

Un problème de type. Lequel ? Indice : cherchez les clients de l'agence de **Nice**. Pour
corriger, regardez les options de `read_files` (`schemaHints`). Vérifiez aussi les deux colonnes de
dates, écrites `jj/mm/aaaa` dans le fichier : quel type ont-elles reçu, et dans quel sens le jour et
le mois ont-ils été lus ?

### Étape 5 · Lire les transactions

Le dossier `transactions/` contient six fichiers Parquet. Lisez-les **en une seule fois**, en
donnant le dossier et non un fichier, et calculez :

- le nombre de lignes et de `transaction_id` distincts ;
- la plus ancienne et la plus récente date d'opération (`horodatage`) ;
- le nombre d'opérations par devise.

### Étape 6 · Le registre des défauts

Écrivez **une requête** qui rend une ligne par défaut, avec le nombre de lignes concernées :

| Défaut | Règle |
|---|---|
| `montant_nul` | une opération de montant 0 |
| `date_future` | une opération datée du 1<sup>er</sup> juillet 2026 ou après |
| `compte_inconnu` | une opération dont le `compte_id` n'est pas dans `comptes.csv` |
| `doublon_en_trop` | les lignes en trop d'un même `transaction_id` |

Indices : `UNION ALL`, `COUNT_IF`, et `LEFT ANTI JOIN` pour « ce qui n'existe pas en face ».

Ajoutez une cinquième ligne : les **comptes** dont le `client_id` n'est pas dans `clients.csv`.

### Bonus

1. Lisez `arrivees/transactions_2026-07-01.csv`. Combien de lignes ont le statut `ANNULEE` ?
   Leurs `transaction_id` existent-ils déjà dans les transactions de janvier à juin ? Qu'est-ce
   que cela annonce pour le TP 5 ?
2. Listez `abfss://formation@<stockage>.dfs.core.windows.net/catalogs/`, le dossier où iront
   les managed tables des catalogs du TP 3. Pourquoi y avez-vous accès ? Regardez sur quel chemin
   porte l'external location `ext_dki_formation`, et quels privileges vous avez dessus
   (`SHOW GRANTS ON EXTERNAL LOCATION ext_dki_formation`).

---

## Ce qu'on attend en fin de TP

Les réponses aux quatre questions de la partie A, et ce tableau rempli, que l'on comparera en
restitution :

| Mesure | Votre résultat |
|---|---|
| Lignes de `clients.csv` / clients distincts | |
| Clients sans e-mail | |
| Lignes de transactions / `transaction_id` distincts | |
| Date d'opération la plus récente | |
| `montant_nul` / `date_future` / `compte_inconnu` / `doublon_en_trop` | |
| Comptes sans client | |

Rien n'est créé dans ce TP : pas de table, pas de vue. Les tables arrivent au TP 3.
