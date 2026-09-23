# 📘 Exercice : Analyse des Expositions dans les Pays Sensibles

Vous travaillez dans le département Risques d’une grande banque internationale.  
Votre mission est d’étudier l’exposition des prêts accordés dans différents pays et d’identifier ceux situés dans des zones considérées sensibles selon les règles internes de conformité (*risk_flag = "high"*).

Deux tables sont mises à disposition :

---

## 📂 Table 1 : `loan_exposure`

Cette table contient les prêts accordés par la banque.

**Colonnes :**

- `loan_id`  
- `client_id`  
- `country`  
- `segment`  
- `ead`  
- `year`  
- `month`  

---

## 📂 Table 2 : `risk_countries`

Cette table répertorie les pays et leur niveau de risque.

**Colonnes :**

- `country`  
- `risk_flag` (*high*, *medium*, *low*)  

Exemples :  

| country | risk_flag |
|---------|-----------|
| FR | high |
| IT | high |
| DE | low |
| US | low |

---

# 🎯 Objectif de l’exercice

Identifier les expositions situées dans les pays sensibles, analyser leur distribution, et observer comment Spark adapte automatiquement la lecture des données lors du traitement.

---

# 🧪 Travail demandé

---

## 📝 Étape 1 — Exploration fonctionnelle des données

1. Quels champs semblent pertinents pour relier les deux tables ?  
2. Quelle relation logique peut-on établir entre les expositions et la table des pays sensibles ?  
3. Quels pays apparaissent dans la table `risk_countries` ?  
4. Quels pays sont considérés comme sensibles (*risk_flag = "high"*) ?

---

## 📝 Étape 2 — Préparation des pays sensibles

1. Filtrer la table `risk_countries` pour ne conserver que les pays ayant `risk_flag = "high"`.  
2. Combien de pays restent après filtrage ?  
3. Pourquoi est-il pertinent d’appliquer ce filtrage avant d’effectuer la jointure ?

---

## 📝 Étape 3 — Jointure entre les expositions et les pays sensibles

Effectuer :

```python
df_sensitive = loan_exposure.join(high_risk_countries, "country")
df_sensitive.count()
```

Questions :

1. Quels sont les pays présents dans le résultat ?  
2. Quelle quantité de données Spark semble avoir lue pour produire ce résultat ?  
3. Quelles différences remarquez-vous dans le plan d’exécution (`explain`) ?  
4. Certaines données semblent-elles avoir été ignorées ? Pourquoi ?  

---

## 📝 Étape 4 — Analyse métier

1. Quel pays sensible présente l’exposition totale la plus élevée ?  
2. Quel segment contribue le plus à l’exposition des pays sensibles ?  
3. Quelle interprétation métier peut-on proposer à partir de ces résultats ?

---

## 📝 Étape 5 — Comparaison avec un traitement non filtré

Effectuer :

```python
df_full = loan_exposure.join(risk_countries, "country")
df_full.count()
```

Questions :

1. Quelle différence de volume de données lues observez-vous par rapport à la jointure filtrée ?  
2. Quelles différences apparaissent dans Spark UI ?  
3. Pourquoi ces différences existent-elles ?  
4. Quel impact cela peut-il avoir sur les performances globales d’un pipeline ?

---

## 📝 Étape 6 — Synthèse finale

1. Pourquoi Spark n’a-t-il pas traité l’ensemble des données dans le cas filtré ?  
2. Quel comportement automatique semble mis en œuvre par Spark lors de ces traitements ?  
3. Dans quels contextes métier ce type d’optimisation pourrait-il être utile ?  
4. Comment structurer d’autres tables pour bénéficier du même type d’optimisation ?

---


---

## ✍️ Signature  
**Mehdi TAJMOUATI**  
*WytaSoft — Unlock the Power of Your Data*

