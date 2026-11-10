# TP 4 — Traduire le vocabulaire du métier

**Durée :** 20 min de travail + 10 min de restitution · **En binôme**, les mêmes qu'hier.

---

## La situation

Le métier ne pose pas ses questions avec les noms de colonnes. Il dit « la prod immo »,
« les dossiers en contentieux », « nos clients pros ». Voici huit expressions relevées
dans les tickets de demande de la semaine.

Pour chacune, vous êtes le moteur : qu'écririez-vous dans le `WHERE`, sur
`socle/modele-socle-participant.sql` ? Et surtout : **qu'avez-vous dû deviner ?**

> **Consigne principale : écrivez la valeur exacte.**
> Pas « le statut contentieux », mais `CD_STA = 'CT'`. Si vous ne savez pas quelle
> valeur écrire, c'est que le modèle ne le dit pas : notez-le, c'est la réponse.

---

## 1. Les huit expressions

| # | Le métier dit | Table(s) et colonne(s) | Filtre exact | Ce qu'il a fallu deviner |
|---|---|---|---|---|
| 1 | « les dossiers en contentieux à Nanterre » | | | |
| 2 | « la prod immo de septembre » | | | |
| 3 | « les crédits de nos clients pros » | | | |
| 4 | « les prélèvements du mois dernier » | | | |
| 5 | « l'encours en Île-de-France » | | | |
| 6 | « les livrets A clôturés » | | | |
| 7 | « les PTZ » | | | |
| 8 | « nos clients à Lyon » | | | |

---

## 2. Le dictionnaire des valeurs

Écrivez le libellé en français de chaque code, pour quatre colonnes. C'est ce que vous
mettrez cet après-midi dans la dimension, à l'étape 2 du TP 2.

| Colonne | Code → libellé |
|---|---|
| `D_CLI.CD_SEG` | `PA` → … · `PR` → … · `PE` → … |
| `F_CRD_MNS.CD_STA` | `AC` → … · `SO` → … · `CT` → … |
| `F_OPE.CD_TYP` | `VIR` → … · `PRL` → … · `CB` → … · `CHQ` → … |
| `D_PRD.CD_SFAM` | `IMMO` → … · `CONSO` → … · `TRESO` → … |

Pour chaque libellé, notez si vous l'avez **lu** quelque part ou **deviné**.

---

## Deux conseils

**Méfiez-vous des mots qui existent deux fois.** Un même mot du métier peut
correspondre à deux colonnes différentes du modèle. Si c'est le cas, notez les deux.

**Un code que vous ne savez pas traduire n'est pas un échec.** C'est exactement la
situation du moteur. La bonne réponse est alors : « à demander au métier ».

Le corrigé est présenté en restitution.
