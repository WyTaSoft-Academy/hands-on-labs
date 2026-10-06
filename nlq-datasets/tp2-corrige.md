# TP 2 — Corrigé

> Comme hier : **il n'y a pas de corrigé unique.** Le modèle de référence est dans
> [`comptoir/modele-comptoir.sql`](comptoir/modele-comptoir.sql) et
> [`comptoir/mesures-comptoir.yaml`](comptoir/mesures-comptoir.yaml), en regard des
> deux fichiers `-participant` que les binômes ont remplis. Ce qui suit explique les décisions qu'il prend, et
> surtout **pourquoi elles sont contestables** — c'est le sujet de la restitution.

---

## Les douze questions, rejouées

| # | Question | Sur `SOCLE` | Sur `COMPTOIR` | Ce qui a changé |
|---|---|---|---|---|
| 1 | Encours immobilier par région | ⚠️ | ✅ | Grain déclaré, `region` en colonne, `sous_famille = 'Immobilier'` en clair, agence porteuse explicite, soldés exclus par la mesure |
| 2 | Clients actifs | ⚠️ | ✅ | Définition écrite dans le commentaire de colonne et dans la mesure. Au présent seulement : voir ci-dessous |
| 3 | Production du mois dernier | ⚠️ | ✅ | Mesure `production_credit`, lue au grain crédit sur `date_deblocage` |
| 4 | Taux moyen immobilier | ⚠️ | ✅ | `taux_moyen_pondere`, numérateur et dénominateur séparés, `AVG` interdit |
| 5 | Opérations par type | ⚠️ | ✅ | Mesure `nombre_operations`, `date_operation` déclarée de référence, `type_operation` et `type_compte` en libellés |
| 6 | Solde moyen des comptes courants | ❌ | ❌ | **Absence déclarée** : le solde n'est pas historisé. Voir ci-dessous |
| 7 | Agence au plus fort encours | ⚠️ | ✅ | Grain déclaré, `agregation_temps: DERNIER` : un seul arrêté, le classement est juste par construction |
| 8 | Âge moyen des emprunteurs | ⚠️ | ✅ | `est_emprunteur` défini (crédit non soldé), et mesure `age_moyen_emprunteurs` au grain client : un client compte une fois |
| 9 | Part des douteux | ⚠️ | ✅ | `part_encours_douteux`, ratio calculé après agrégation, dénominateur = la mesure `encours_credit` |
| 10 | Clients partis ce trimestre | ⚠️ | ⚠️ | Voir ci-dessous — la définition métier manque toujours |
| 11 | Satisfaction par agence | ❌ | ❌ | **Absence déclarée.** Le moteur refuse au lieu d'approcher |
| 12 | Canal de souscription | ❌ | ❌ | **Absence déclarée.** Idem |

**Aucune verte hier, huit aujourd'hui.** Et quatre qui ne passent pas : deux qui ne
passeront jamais, une qui attend un projet d'historisation, une qui attend une
décision métier.

---

## Les décisions qui méritent d'être discutées

### La région : celle de l'agence porteuse

`COMPTOIR` tranche pour l'**agence qui porte le crédit**, et nomme explicitement
`dim_client.agence_rattachement_id` pour qu'on ne les confonde plus.

C'est un choix, pas une vérité. Le pilotage commercial préférera souvent l'agence
de rattachement du client. **Ce qui compte, c'est que le choix soit écrit** : hier,
le moteur tranchait en silence ; aujourd'hui, le métier peut contester une décision
visible.

> En restitution : demander qui a choisi l'autre option, et pourquoi. Les deux
> réponses sont bonnes, l'absence de choix ne l'était pas.

### L'encours : soldés exclus, contentieux inclus

`encours_credit` exclut les crédits soldés et **garde les dossiers en contentieux**.
C'est le périmètre de l'encours brut, et c'est la seule façon de rendre la question 9
cohérente : `part_encours_douteux` prend pour dénominateur **la mesure
`encours_credit` elle-même**, pas une somme refaite à côté.

Le piège à montrer en restitution : un binôme qui exclut le contentieux de l'encours
puis calcule la part des douteux sur « tout le capital restant dû » a construit
**deux encours dans le même modèle** — exactement ce que le comptoir doit empêcher.

### « Client actif » : 90 jours

`COMPTOIR` écrit : *« au moins un produit non clos ET au moins une opération dans
les 90 jours précédant la date d'arrêté »*, validé par la Direction Commerciale.

Le chiffre 90 est arbitraire. Ce qui ne l'est pas :

- il est **écrit** ;
- il est **daté** et porte un **nom de direction** ;
- toute autre définition doit être demandée explicitement.

C'est la différence entre une convention et un hasard.

### La production : le piège du modèle

`montant_octroye` est répété sur chaque ligne mensuelle. Trois façons de traiter,
par ordre de qualité :

1. **La bonne** — déclarer `grain_requis: credit` et `date_reference:
   date_deblocage` sur la mesure. Le moteur lit une ligne par crédit.
2. **L'acceptable** — construire une seconde table de faits au grain crédit
   (`credit_octroi`), et y placer la production. Plus de tables, moins de pièges.
3. **La mauvaise** — exposer `montant_octroye` comme mesure sommable. Elle
   fonctionnera sur un mois, et sera fausse d'un facteur douze sur une année.

La troisième est celle que produit un renommage sans réflexion sur les mesures.

### Une table de faits sans mesure n'est pas finie

`operation_compte` est passée près de sortir au comptoir **sans aucune mesure
certifiée** : des noms propres, une date de référence déclarée, et rien qui dise
comment on compte. C'est la dérive que l'énoncé appelle « renommer sans définir »,
et elle est difficile à voir parce que le modèle a l'air propre.

Le modèle de référence déclare donc `nombre_operations` — famille flux, comptage sur
`date_operation` — et **interdit explicitement `SUM(montant)`** : la colonne est
signée, et une somme naïve mélange débits et crédits pour produire un solde de flux
que personne n'a demandé. Un montant par sens est une autre mesure, avec son filtre
écrit.

> La règle à emporter : **chaque table de faits exposée a au moins une mesure
> certifiée.** Sinon, chaque question invente la sienne.

### L'âge moyen (question 8) : une moyenne est un ratio

La question paraît réglée dès que `age` est exposé et `est_emprunteur` défini. Elle
ne l'est pas : `AVG(age)` calculé sur une jointure à `encours_credit_mensuel` pondère
chaque client par son nombre de crédits **et** de photos mensuelles. Un client à trois
crédits pèse trente-six fois dans la moyenne annuelle.

D'où `age_moyen_emprunteurs`, déclarée comme un ratio — numérateur `SUM(age)`,
dénominateur `COUNT(DISTINCT client_id)` — avec `grain_requis: client`. C'est la même
leçon que le taux moyen de la question 4, sur un indicateur qui n'a pas l'air d'un
ratio. **Toute moyenne en est un.**

### `dim_client` n'est pas historisée, et c'est déclaré

`est_client_actif` et `est_emprunteur` décrivent un état **à une date**. Or `D_CLI`
ne date rien : `TOP_ACT` est un drapeau sans photo ni historique. Deux sorties
possibles, et une seule est honnête :

- **Historiser la dimension** — c'est-à-dire fabriquer un passé que les sources ne
  contiennent pas. C'est exactement l'erreur que l'énoncé sanctionne : inventer de
  la donnée.
- **Écraser, et le déclarer** — la dimension décrit le dernier arrêté chargé, la
  table le dit dans son commentaire, et « combien de clients actifs en mars ? »
  rejoint `absences_declarees`.

Le modèle retient la seconde. C'est le cas d'école de l'annexe sur l'historisation,
vu de l'intérieur : le choix par défaut importe moins que le fait qu'il soit écrit.
Un binôme qui a ajouté une `date_arrete` à `dim_client` sans pouvoir dire d'où
viendraient les valeurs a créé le défaut qu'il diagnostiquait hier.

### `D_CPT` ne sort pas, et `type_compte` la remplace

La table des comptes ne portait en propre qu'un solde sans date. L'exposer telle
quelle aurait ajouté une dimension dont la seule colonne intéressante est
inexploitable — et laissé `compte_id` pointer vers rien.

Le comptoir garde donc `compte_id` comme clé de comptage, **dénormalise la nature du
compte** dans `operation_compte.type_compte` (Compte courant, Livret A, PEL, Compte à
terme) pour qu'une question puisse dire « les comptes courants », et déclare le solde
en absence. Le commentaire de colonne dit tout cela, y compris pourquoi `type_compte`
ne se confond pas avec `type_operation` : l'un dit **sur quoi**, l'autre **ce qui a
été fait**.

### Le solde moyen (question 6) : honnêtement limité

`D_CPT.SLD` n'a pas de date, et aucun historique n'existe. `COMPTOIR` ne peut pas
inventer ce qui n'a pas été historisé.

Deux réponses possibles, toutes deux défendables :

- **Ne pas exposer** le solde tant qu'il n'est pas historisé — cohérent avec la
  règle « ce qu'on ne sait pas décrire ne sort pas au comptoir » ;
- **L'exposer en le nommant pour ce qu'il est** : `solde_dernier_connu`, avec une
  description qui dit que la date n'est pas maîtrisée.

Le modèle de référence retient la première, **déclare l'absence** dans
`absences_declarees` — sinon le moteur irait chercher la colonne la plus ressemblante,
une somme d'opérations par exemple — et inscrit l'historisation du solde au programme
des évolutions. La question passe donc en ❌ : un refus motivé. C'est le seul point du
TP où la bonne réponse est un **projet**, pas une écriture.

### Les clients partis (question 10) : toujours ⚠️

`date_sortie_relation` existe, mais la règle qui la renseigne n'est écrite nulle
part — et « quitter la banque » n'a pas de définition partagée.

C'est le cas le plus instructif du TP : **la couche sémantique ne crée pas
l'accord**. Elle rend visible qu'il manque. La bonne action n'est pas technique,
c'est une réunion avec la Direction Commerciale.

Un binôme qui laisse cette question en ⚠️ avec cette justification a mieux travaillé
qu'un binôme qui la passe en ✅ en inventant une règle.

### Les deux impossibles : déclarer l'absence

`COMPTOIR` porte une rubrique `absences_declarees` pour la satisfaction, le canal,
le solde historisé et le statut client à une date passée, chacun avec ses synonymes
et la réponse attendue.

C'est contre-intuitif — on documente ce qu'on n'a pas — et c'est ce qui distingue
un modèle mûr : **sans cette déclaration, un moteur cherchera la colonne la plus
ressemblante.** L'agence, pour le canal. Et produira un indicateur faux que
personne ne remettra en cause six mois plus tard.

---

## Ce que la restitution doit faire apparaître

1. **Le gros du travail n'était pas technique.** Aucune source n'a été touchée et
   `SOCLE` n'a pas bougé : on a renommé, déclaré, écrit — et calculé quelques
   colonnes au-dessus (`age`, `est_client_actif`, `est_emprunteur`). La difficulté
   était de se mettre d'accord.
2. **Huit sur douze, pas douze sur douze.** Un modèle qui répond à tout est un
   modèle qui invente. Les quatre restantes sont quatre réponses honnêtes.
3. **Les désaccords entre binômes sont le livrable réel.** Région du client ou de
   l'agence, 90 ou 180 jours : ces arbitrages appartiennent au métier, et le NLQ
   les rend obligatoires.
4. **Le modèle se révise.** La ligne `revue_le` n'est pas décorative : une
   définition fausse et écrite s'applique avec constance, à grande échelle.
