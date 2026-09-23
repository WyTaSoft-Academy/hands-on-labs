# ❓ Exercice Spark 3.5 — Skew Join Handling v2  
## Questions (sans réponses)

---

## 🔎 Étape 1 — Compréhension des données

1. Quelle est la répartition des valeurs dans la colonne `country` pour les tables `transactions` et `clients` ?
2. Quels pays semblent majoritaires ou minoritaires ?
3. En observant la distribution, quelle clé pourrait poser un problème de skew lors d’une jointure ?
4. Pourquoi un dataset fortement déséquilibré peut-il ralentir une jointure Spark ?

---

## 🔄 Étape 2 — Jointure

5. Combien de partitions Spark a-t-il généré pendant le shuffle de la jointure ?
6. Les tâches sont-elles équilibrées, ou observe-t-on une disparité dans leur durée ?
7. Quelle clé semble causer une tâche particulièrement longue ?
8. Quel type de join est utilisé dans le plan physique (SortMergeJoin, ShuffleHashJoin, etc.) ?
9. Pourquoi Spark ne détecte-t-il pas automatiquement le skew dans ce premier scénario ?

---

## 🚀 Étape 3 — Skew Join Handling

10. Quelles différences observez-vous dans le plan d’exécution ?
11. Voyez-vous des opérateurs indiquant une gestion du skew, tels que :
   - `SkewedJoin`
   - `SplitPartition`
   - `PartialShuffleReader`
   - `CoalescedShuffleReader`
12. Pourquoi Spark décide-t-il de découper la partition liée à certains pays (notamment "FR") ?
13. Comment Spark ajuste-t-il le nombre de partitions pour les clés minoritaires ?
14. Le temps d’exécution du `count()` a-t-il changé ? Comment l’expliquez-vous ?

---

## 📊 Étape 4 — Analyse des performances

15. Quelles différences remarquez-vous dans Spark UI entre l’exécution sans optimisation et avec optimisation ?
16. Le skew est-il totalement éliminé ou seulement atténué ?
17. Pourquoi la stratégie de splitting adaptatif permet-elle d’éviter des tâches très longues (long tail) ?
18. Que se passerait-il si les paramètres `skewedPartitionFactor` ou `skewedPartitionThresholdInBytes` étaient trop élevés ?
19. Et s’ils étaient trop bas ?

---

## 🧠 Étape 5 — Analyse métier & bonnes pratiques

20. Pourquoi ce type de skew est-il courant dans des données métier réelles (banque, retail, telecom…) ?
21. Quelles peuvent être les conséquences d’un skew non géré sur :
   - un pipeline batch ?
   - un job streaming ?
   - un job ML (feature engineering) ?
22. En dehors de Skew Join Handling, quelles autres méthodes structurantes peuvent réduire le skew côté modèle de données ?
23. Dans quels cas la mitigation automatique de Spark n’est-elle pas suffisante ?
24. Comment détecter de manière proactive le skew dans un pipeline de production ?

