# TP 3 — Écrire une mesure certifiée

**Durée :** 15 min de travail + 5 min de restitution · **En binôme**, les mêmes qu'hier.

---

## La situation

Une treizième question arrive du métier, ce matin :

> **« Quel est le montant moyen d'un crédit accordé ? »**

La question a l'air simple. Elle est courte, il n'y a qu'un chiffre à rendre, et la
colonne existe : `MT_OCT`, le montant octroyé, dans `F_CRD_MNS`.

Votre travail : écrire la **mesure certifiée** qui y répond, au format de la slide
que vous venez de voir. Une seule mesure, ses treize lignes.

> **Consigne principale : chaque ligne est une décision.**
> Une ligne laissée vide, c'est une décision laissée au moteur. Si vous hésitez entre
> deux choix, choisissez-en un, écrivez-le, et notez l'autre en commentaire.

---

## Le gabarit à remplir

```yaml
- nom:
  libelle:
  description:          # une phrase, pour quelqu'un qui ne connaît pas le métier
  synonymes: []         # ce que le métier dit réellement
  famille:              # FLUX | STOCK | RATIO | COMPTAGE
  numerateur:           # si RATIO
  denominateur:         # si RATIO
  agregation_temps:     # SOMME | DERNIER | interdit
  filtre_implicite:     # quels crédits comptent ?
  grain_requis:         # à quel niveau la moyenne se calcule-t-elle ?
  date_reference:       # quelle date place un crédit dans une période ?
  unite:
  certifiee_par:        # un nom de direction, pas « l'équipe data »
  revue_le:
```

Les colonnes utiles sont dans `socle/modele-socle-participant.sql`.

---

## Quatre questions pour vous aider

1. **Une moyenne de quoi ?** `F_CRD_MNS` a une ligne par crédit **et par mois**. Un
   crédit de 2019 y figure quatre-vingt-dix fois, un crédit de septembre une seule.
   Qu'arrive-t-il si l'on fait la moyenne des lignes ?
2. **Quels crédits ?** Les crédits aux professionnels comptent-ils ? Le prêt à taux
   zéro, qui accompagne toujours un autre prêt, est-il un crédit à part entière ?
3. **Sur quelle période ?** « Accordé » quand ? Depuis toujours, cette année, le mois
   dernier ? Et quelle date fait foi : la date d'arrêté ou la date de déblocage ?
4. **Qui tranche ?** Si deux directions donnent deux chiffres, laquelle a raison ?

---

## La restitution

Deux ou trois binômes lisent leur `filtre_implicite`, leur `grain_requis` et leur
`date_reference`. On compare. Si deux binômes ont écrit deux choses différentes, la
salle vient de produire deux chiffres pour la même question, et c'est le sujet.

Le corrigé est présenté en restitution.
