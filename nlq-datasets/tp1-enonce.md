# TP 1 — Diagnostic d'un dataset existant

**Durée :** 1 h 10 de travail + 20 min de restitution · **En binôme**, de préférence un profil technique avec un profil métier.

---

## La situation

La direction a vu une démonstration : on pose une question en français, un chiffre
apparaît. Elle veut la même chose sur le périmètre **crédits et clients**, et elle a
fourni douze questions que le métier veut pouvoir poser.

On vous demande si c'est faisable **sur le modèle existant**.

Le modèle, c'est [`socle/modele-socle-participant.sql`](socle/modele-socle-participant.sql) :
six tables, telles qu'elles sont aujourd'hui dans l'entrepôt, avec quelques valeurs
observées dans les colonnes de codes. Vous n'avez pas d'autre documentation — et
c'est précisément le sujet.

> **Consigne principale : on diagnostique, on ne corrige pas.**
> La correction, c'est le TP 2, demain. Aujourd'hui on établit ce qui ne va pas
> et **pourquoi**. Un binôme qui a réécrit le modèle a fait le mauvais exercice.

---

## Les douze questions du métier

| # | Question |
|---|---|
| 1 | Quel est l'encours de crédit immobilier par région au dernier arrêté ? |
| 2 | Combien avons-nous de clients actifs ? |
| 3 | Quelle a été la production de crédits le mois dernier ? |
| 4 | Quel est le taux moyen des crédits immobiliers ? |
| 5 | Combien d'opérations par type le mois dernier ? |
| 6 | Quel est le solde moyen des comptes courants ? |
| 7 | Quelle agence porte le plus d'encours ? |
| 8 | Quel est l'âge moyen de nos clients emprunteurs ? |
| 9 | Quelle est la part des crédits douteux dans l'encours ? |
| 10 | Combien de clients ont quitté la banque ce trimestre ? |
| 11 | Quel est le taux de satisfaction client par agence ? |
| 12 | Quel canal a généré le plus de souscriptions de crédit ? |

---

## Ce que vous produisez

### 1. Le classement des douze questions

Pour chacune, une ligne et une seule :

| Verdict | Ce qu'il signifie |
|---|---|
| ✅ **Interrogeable** | Un moteur y répondrait juste, sans avoir à deviner. |
| ⚠️ **Partiellement** | Il répondra — mais il aura tranché quelque chose à votre place. Dites quoi. |
| ❌ **Pas exploitable** | Aucune réponse fiable possible en l'état. Dites ce qui manque. |

### 2. La cause, nommée

Pour chaque question qui n'est pas verte, nommez la cause avec **le vocabulaire du jour 1** :

- `AMBIGUÏTÉ SÉMANTIQUE` — un mot du métier n'a pas de définition unique
- `GRAIN` — le sens d'une ligne n'est pas déclaré, l'agrégation sera fausse
- `JOINTURE IMPLICITE` — plusieurs chemins possibles, plusieurs résultats
- `DATE` — plusieurs dates candidates, aucune ne fait foi
- `MESURE ABSENTE` — l'indicateur n'est défini nulle part
- `AGRÉGATION` — la mesure existe mais son mode de calcul n'est pas déclaré
- `DONNÉE INEXISTANTE` — l'information n'est pas dans le système

Une question peut cumuler deux causes. Notez les deux.

### 3. Les trois défauts les plus coûteux

C'est le livrable de la restitution. Parmi tout ce que vous avez trouvé, les **trois
défauts qui, corrigés, débloqueraient le plus de questions**. Pour chacun :

- ce qu'il est, en une phrase ;
- combien de questions il bloque ou fausse ;
- ce qu'il faudrait écrire pour le lever.

---

## La grille à remplir

```
Q#  Verdict   Cause(s)              Ce que le moteur devra deviner
--  --------  --------------------  ------------------------------------------
1   [ ]       ....................  ..........................................
2   [ ]       ....................  ..........................................
...
```

---

## Trois conseils

**Ne cherchez pas la documentation : il n'y en a pas.** Le fichier ne porte que
des noms, des types et quelques valeurs de codes. C'est exactement la situation d'un
moteur NLQ. La version commentée du modèle vous sera remise après la restitution.

**Le test du grain.** Pour chaque table de faits, lisez une ligne à voix haute en
commençant par « ceci est un… ». Si la phrase ne se termine pas naturellement, vous
tenez un défaut.

**Méfiez-vous des questions qui paraissent simples.** Les questions 2 et 5 sont
les plus courtes de la liste. Ce ne sont pas les plus faciles.

---

## Attention

Deux des douze questions n'ont **aucune réponse possible**, quel que soit le travail
de modélisation. Les repérer fait partie de l'exercice — et savoir le dire au métier
vaut mieux que livrer un chiffre inventé.

Le corrigé est présenté en restitution.
