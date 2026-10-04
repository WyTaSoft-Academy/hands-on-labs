# TP 2 — Reformulation d'un modèle pour le NLQ

**Durée :** 1 h 30 de travail + 30 min de restitution · **En binôme**, même binôme qu'hier.

---

## La situation

Hier, vous avez établi qu'**aucune des douze questions** ne passait sur `SOCLE`
sans que le moteur ait à deviner quelque chose, et vous avez nommé les trois défauts
les plus coûteux.

Aujourd'hui vous produisez `COMPTOIR` : le même contenu, rendu interrogeable.

> **Ce n'est pas une refonte.** `SOCLE` reste en place et continue d'alimenter ce
> qu'il alimente. Vous construisez une **couche au-dessus** : mêmes données, autres
> noms, et surtout du sens écrit.

---

## Ce qu'on vous remet, et sous quelle forme vous rendez

Deux squelettes à compléter, à ouvrir dans un éditeur de texte :

| Fichier | Pour les étapes |
|---|---|
| [`comptoir/comptoir-participant.sql`](comptoir/comptoir-participant.sql) | 1 et 2 — les tables, leurs colonnes, leur grain |
| [`comptoir/mesures-participant.yaml`](comptoir/mesures-participant.yaml) | 3 et 4 — les six mesures, les quatre absences, les questions rejouées |

**Aucun SQL exécutable n'est attendu, et rien ne se lance.** Les étapes 1 et 2 se
remplissent en nommant des colonnes et en écrivant des commentaires ; l'étape 3 en
remplissant un gabarit ; l'étape 4 en une ligne par question. Un binôme métier peut
tenir le clavier du début à la fin.

---

## Les quatre étapes

### 1. Renommer et déclarer · ≈ 20 min

Reprenez les deux tables de faits et les quatre dimensions.

- [ ] Des **noms lisibles** : `MT_CRD_RST` → `capital_restant_du`. Pas d'abréviation
      qu'il faille connaître.
- [ ] Le **grain écrit en toutes lettres** dans le commentaire de chaque table de
      faits. Faites le test : « ceci est un… ».
- [ ] **Une seule date de référence** par table. Les autres sont nommées sans
      ambiguïté, ou ne sortent pas au comptoir.
- [ ] Les **colonnes techniques retirées** : `DT_INS`, drapeaux de traitement,
      clés de rapprochement.

### 2. Redresser les dimensions · ≈ 20 min

- [ ] La **hiérarchie produit dénormalisée** : `famille`, `sous_famille`, `produit`
      en colonnes, avec des **libellés en clair** et pas seulement des codes.
- [ ] Idem pour la géographie : `region`, `departement`, `agence`.
- [ ] Les codes remplacés par des libellés : `CD_SEG = 'PA'` → `segment =
      'Particulier'`.
- [ ] Les colonnes dont le nom **cachait un piège** explicitées :
      `CD_AGE_RAT` → `agence_rattachement_id`, pour qu'on ne la confonde plus avec
      l'agence porteuse du crédit.

### 3. Définir six mesures certifiées · ≈ 35 min

C'est l'étape qui compte. **Au moins une par famille** : flux, stock, ratio,
comptage distinct.

Pour chacune, les **treize lignes de la slide d'anatomie**, sans en sauter une :

```yaml
- nom:
  libelle:
  description:          # une phrase, pour quelqu'un qui ne connaît pas le métier
  synonymes: []         # ce que le métier dit réellement
  famille:              # FLUX | STOCK | RATIO | COMPTAGE_DISTINCT
  expression:           # ou numerateur / denominateur pour un ratio
  agregation_temps:     # SOMME | DERNIER | interdit
  filtre_implicite:     # la décision métier, écrite une fois
  grain_requis:         # le grain auquel la mesure est juste
  date_reference:       # LA date qui fait foi pour cette mesure
  unite:
  certifiee_par:        # un nom de direction, pas « l'équipe data »
  revue_le:             # une définition non datée n'est pas révisable
```

Le gabarit est déjà en place, six fois, dans `mesures-participant.yaml`.

> **Le piège de l'étape 3 :** la mesure `production_credit`. `montant_octroye` est
> répété sur chaque ligne mensuelle du crédit. Une mesure qui le somme sans
> précaution compte le même crédit douze fois. Comment le déclarez-vous ?

### 4. Rejouer les douze questions · ≈ 15 min

Reprenez la liste d'hier. Pour chacune :

- [ ] Passe-t-elle maintenant ? Avec quelle mesure et quelles dimensions ?
- [ ] Si elle ne passe pas, **pourquoi** — et est-ce acceptable ?

---

## Le livrable

1. `comptoir-participant.sql` rempli — tables, colonnes, et le grain de chaque table de faits.
2. Les six définitions de mesures, aux treize lignes, dans `mesures-participant.yaml`.
3. **Une phrase par question restée sans réponse.** C'est ce qui sera présenté.

> **Vous avez fini quand** le grain des deux tables de faits est écrit, que les six
> mesures portent leurs treize lignes, que les absences sont déclarées, et que les
> douze questions ont chacune un verdict d'une ligne. Pas avant, et rien de plus.

---

## Ce qui est évalué

Pas le nombre de questions qui passent. **Ce que vous avez décidé, et si vous
pouvez le défendre devant le métier.**

Deux binômes qui définissent « client actif » différemment ont tous les deux raison,
à condition que chacun sache dire ce que sa définition inclut et exclut. Le
désaccord entre binômes est le meilleur moment de la restitution : c'est exactement
la réunion qui n'a jamais eu lieu dans votre organisation.

---

## Deux avertissements

**Les deux questions impossibles d'hier doivent rester impossibles.** Si votre
modèle y répond, vous avez inventé de la donnée. Même chose pour le solde moyen
(question 6) : un solde sans date ne devient pas historisé parce qu'on le renomme. La bonne réponse est de **déclarer
l'absence** pour que le moteur dise « je n'ai pas cette information » plutôt que
d'approcher avec ce qui ressemble.

**Ne renommez pas sans définir.** Un modèle aux noms magnifiques et sans mesures
certifiées n'a pas progressé : il est simplement plus agréable à lire pendant qu'il
produit des chiffres faux.

---

Le corrigé et le modèle de référence complet sont présentés en restitution : les deux
fichiers `-participant` sont les seuls à ouvrir pendant le TP.
