# TP 1 — Corrigé

> **Il n'y a pas de corrigé unique.** Ce document donne le classement attendu et
> surtout les **causes**. Un binôme qui classe une question « partiellement » là où
> ce document dit « pas exploitable » n'a pas tort s'il sait dire ce que le moteur
> devra deviner. C'est cela qui est évalué.

---

## Le classement

| # | Question | Verdict | Cause principale |
|---|---|---|---|
| 1 | Encours immobilier par région au dernier arrêté | ⚠️ | `JOINTURE IMPLICITE` + `GRAIN` |
| 2 | Combien de clients actifs | ⚠️ | `AMBIGUÏTÉ SÉMANTIQUE` |
| 3 | Production de crédits le mois dernier | ⚠️ | `DATE` + `MESURE ABSENTE` |
| 4 | Taux moyen des crédits immobiliers | ⚠️ | `AGRÉGATION` |
| 5 | Opérations par type le mois dernier | ⚠️ | `DATE` + `AMBIGUÏTÉ SÉMANTIQUE` |
| 6 | Solde moyen des comptes courants | ❌ | `DATE` — le solde n'a pas de date |
| 7 | Agence portant le plus d'encours | ⚠️ | `GRAIN` + `DATE` |
| 8 | Âge moyen des clients emprunteurs | ⚠️ | `AMBIGUÏTÉ SÉMANTIQUE` + `GRAIN` |
| 9 | Part des crédits douteux dans l'encours | ⚠️ | `AGRÉGATION` |
| 10 | Clients partis ce trimestre | ⚠️ | `AMBIGUÏTÉ SÉMANTIQUE` |
| 11 | Taux de satisfaction par agence | ❌ | `DONNÉE INEXISTANTE` |
| 12 | Canal ayant généré le plus de souscriptions | ❌ | `DONNÉE INEXISTANTE` |

**Aucune verte sur douze.** Aucune question n'était piégée, et aucune ne passe sans
que le moteur ait à deviner quelque chose. C'est un résultat normal pour un entrepôt
qui n'a jamais été conçu pour être interrogé en langage naturel. Ce n'est pas un
mauvais entrepôt.

---

## Le détail, question par question

### 1 — Encours immobilier par région au dernier arrêté ⚠️

Trois décisions pour le moteur :

- **Quelle région ?** `CD_REG` n'existe que sur `D_AGE`. On y arrive soit par
  `F_CRD_MNS.ID_AGE` (l'agence qui porte le crédit), soit par
  `D_CLI.CD_AGE_RAT` (l'agence de rattachement du client). Les deux chemins sont
  valides en SQL et donnent des totaux différents dès qu'un client a déménagé.
- **Quel « immobilier » ?** `CD_SFAM = 'IMMO'` — mais rien ne relie le mot
  « immobilier » à ce code.
- **Quel grain ?** Si le moteur ne filtre pas sur un seul `DT_ARR`, il somme
  plusieurs photos mensuelles du même crédit.

> Le mot « au dernier arrêté » sauve partiellement la question : il pousse vers un
> filtre sur une date. Sans lui, l'erreur de grain était quasi certaine.

### 2 — Combien de clients actifs ⚠️

`D_CLI.TOP_ACT` existe, et c'est le piège : le moteur va le trouver et l'utiliser,
avec assurance. Or **personne ne sait ce que cette colonne signifie**. Détient un
produit ? A fait une opération récemment ? N'est pas sorti ?

La question paraît la plus simple des douze. Elle est la plus dangereuse, parce
qu'elle produira un chiffre net, unique, et invérifiable.

### 3 — Production de crédits le mois dernier ⚠️

- **`MESURE ABSENTE`** : « production » ne figure nulle part. Le candidat naturel
  est `MT_OCT`, mais il est présent sur **chaque ligne mensuelle** du crédit — le
  sommer sur un mois d'arrêté compte tous les crédits vivants, pas les nouveaux.
  Il faut le lire au grain crédit, filtré sur `DT_DEB`.
- **`DATE`** : « le mois dernier » — `DT_DEB` (déblocage) ou `DT_ARR` (arrêté) ?

C'est l'exemple le plus net de la journée : une mesure qui existe physiquement,
mais dont **le mode de lecture n'est écrit nulle part**.

### 4 — Taux moyen des crédits immobiliers ⚠️

`TX_NOM` est un ratio. `AVG(TX_NOM)` donne la moyenne arithmétique des taux, ce qui
traite un crédit de 15 000 € comme un crédit de 400 000 €.

Le taux moyen attendu est **pondéré par le capital** :
`SUM(TX_NOM * MT_CRD_RST) / SUM(MT_CRD_RST)`.

Les deux chiffres sont plausibles, et écartés de plusieurs dixièmes de point.

### 5 — Opérations par type le mois dernier ⚠️

- **`DATE`** : `DT_OPE` ou `DT_CPT` ? Elles diffèrent de quelques jours, ce qui
  déplace les opérations de fin de mois d'un mois sur l'autre.
- **`AMBIGUÏTÉ`** : `CD_TYP` vaut `VIR`, `PRL`, `CB`, `CHQ`. Aucune table de
  libellés. Une question sur « les virements » ne trouvera `VIR` que par chance.

### 6 — Solde moyen des comptes courants ❌

`D_CPT.SLD` est un solde **sans date**. On ignore de quand date la photo, et il n'y
a pas d'historique. Un moteur répondra — il calculera une moyenne sur une colonne
qui existe — et le chiffre ne voudra rien dire.

Classer cette question en « partiellement » est défendable si l'on précise que la
réponse ne pourra pas être datée. Le point important est de voir que **la colonne
existante ne porte pas l'information demandée**.

### 7 — Agence portant le plus d'encours ⚠️

Presque faisable : `F_CRD_MNS.ID_AGE` vers `D_AGE.LIB_AGE`, **à condition** de
filtrer sur un seul `DT_ARR`. La question ne dit pas lequel — « porte » suggère le
dernier arrêté, mais rien ne l'écrit.

Sans ce filtre, le moteur somme toutes les photos mensuelles. On pourrait croire
que le classement y résiste, puisque toutes les agences sont gonflées. Elles ne le
sont **pas du même facteur** : une agence au portefeuille jeune a moins de photos
mensuelles qu'une agence au portefeuille ancien, et une agence dont l'encours a
fondu cette année garde tout son passé dans le total.

> Point à faire remarquer en restitution : c'est la question la plus trompeuse de la
> liste. L'erreur de grain y **change rarement la réponse** — assez rarement pour que
> personne ne la voie, et jamais assez pour qu'on puisse s'y fier. Le jour où deux
> agences sont proches, l'ordre s'inverse sans prévenir.

### 8 — Âge moyen des clients emprunteurs ⚠️

`D_CLI.DT_NAI` existe, les emprunteurs se trouvent par jointure sur `F_CRD_MNS`.
L'âge est non additif mais la moyenne simple est ici la bonne — un client compte
pour un. Deux décisions restent pourtant au moteur :

- **`AMBIGUÏTÉ`** : qu'est-ce qu'un « emprunteur » ? Les crédits soldés restent
  dans la table (`CD_STA = 'SO'`). Un client qui a remboursé son dernier crédit en
  2019 est-il encore un emprunteur ? C'est la même question que les soldés de la
  question 1.
- **`GRAIN`** : dédoublonner les clients qui ont plusieurs crédits, et plusieurs
  lignes mensuelles. `COUNT DISTINCT` plutôt que `COUNT`.

### 9 — Part des crédits douteux dans l'encours ⚠️

`TOP_DOU` permet le filtre. Le piège est que « part » est un **ratio** : il faut
`SUM(MT_CRD_RST) filtré / SUM(MT_CRD_RST) total`, calculé au niveau demandé.

Un moteur qui calcule la part par agence puis en fait la moyenne pour le national
produit une moyenne de moyennes — fausse.

### 10 — Clients partis ce trimestre ⚠️

`DT_SOR` existe. Mais « quitter la banque » n'a pas de définition unique : clôture
de tous les comptes, résiliation formelle, absence d'opération prolongée ? Et un
client parti puis revenu ?

`DT_SOR` est renseignée par un processus dont la règle n'est écrite nulle part.

### 11 — Taux de satisfaction par agence ❌ `DONNÉE INEXISTANTE`

Aucune donnée de satisfaction dans le modèle. Ni note, ni enquête, ni réclamation.

**Aucune couche sémantique ne créera cette donnée.** La bonne réponse au métier est
« cette information n'est pas dans l'entrepôt », suivie de « voulez-vous qu'on
l'y amène ? ». C'est un projet de collecte, pas de modélisation.

### 12 — Canal ayant généré le plus de souscriptions ❌ `DONNÉE INEXISTANTE`

Même situation. Le modèle porte l'agence, pas le canal — un crédit souscrit en ligne
et rattaché administrativement à une agence est indiscernable d'un crédit souscrit
au guichet.

> **Attention au faux ami :** un binôme peut proposer d'utiliser `ID_AGE` comme
> approximation du canal. C'est exactement le genre de substitution qui produit un
> indicateur faux que plus personne ne remet en cause six mois plus tard.

---

## Les trois défauts les plus coûteux

C'est le livrable de la restitution. Dans l'ordre :

### 1. Le grain de `F_CRD_MNS` n'est pas déclaré

**Bloque ou fausse :** 1, 3, 4, 7, 8, 9 — la moitié des questions.
**À écrire :** « une ligne = un crédit × un mois d'arrêté », et pour chaque mesure,
son comportement dans le temps.
**Pourquoi c'est le pire :** l'erreur ne produit aucun message. Elle produit un
chiffre du bon type, dans la bonne unité, faux d'un facteur douze.

### 2. Aucune mesure n'est définie

**Bloque ou fausse :** 3, 4, 9 directement, et toutes les autres indirectement.
**À écrire :** encours, production, taux moyen, part de douteux — avec leur formule,
leur agrégation et leur filtre implicite.
**Pourquoi :** tant qu'aucune mesure n'est certifiée, chaque question invente la
sienne. Deux questions voisines donneront deux chiffres différents.

### 3. Les termes métier n'ont pas de définition

**Bloque ou fausse :** 2, 5, 10, et partiellement 1 et 8.
**À écrire :** « client actif », « emprunteur », « immobilier », « quitter la banque », les libellés
de `CD_TYP` et de `CD_SEG`.
**Pourquoi :** c'est le moins technique des trois, le plus rapide à corriger, et
celui qui demande le plus de réunions — parce qu'il faut se mettre d'accord.

---

## Ce que la restitution doit faire apparaître

1. **Aucune question verte sur douze** n'est pas un échec de l'entrepôt : c'est
   l'écart normal entre « stocker » et « se faire interroger en français ».
2. **Les trois défauts coûteux sont des défauts d'écriture**, pas d'architecture.
   Aucun ne demande de toucher aux sources : on écrit, et on expose au-dessus.
3. **Trois questions resteront rouges demain.** Deux parce que la donnée n'existe
   pas, une parce que le solde n'a jamais été historisé. Savoir le dire est un
   livrable, pas un aveu.
