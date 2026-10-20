# Programme — NLQ, Partie 2 : Snowflake Intelligence & Cortex Analyst

Deux jours, en suite de la Partie 1 ([`../nlq-datasets/`](../nlq-datasets/README.md)).

### Jour 3 — Snowflake Intelligence

**Introduction**
- Présentation de l'analytique conversationnelle dans Snowflake.
- Snowflake Intelligence : interface et orchestration conversationnelle.
- Cortex Analyst : moteur d'interprétation NLQ → SQL.

**Snowflake Intelligence : périmètre et usages**
- Snowflake Intelligence comme interface conversationnelle.
- Gestion du contexte : questions successives, reformulations, enrichissement progressif de l'analyse.
- Différence entre : exploration conversationnelle, reporting gouverné, BI classique.

**Interaction avec le moteur analytique**
- Comment Snowflake Intelligence collecte la question utilisateur, enrichit le contexte, transmet la demande à Cortex Analyst.
- Ce qui n'est pas de sa responsabilité : choix des agrégations, validation métier des chiffres, correction des erreurs de modèle.

**Travaux pratiques — Exploration conversationnelle avec Snowflake Intelligence**
- Interrogation du cube via Snowflake Intelligence.
- Enchaînement de questions analytiques.
- Observation : des réponses produites, du contexte conservé, de la cohérence des résultats.
- Identification des limites liées au modèle de données.

### Jour 4 — Cortex Analyst

**Cortex Analyst : rôle et responsabilités**
- Cortex Analyst comme moteur d'analyse NLQ.
- Différence entre compréhension linguistique et raisonnement analytique.
- Ce que Cortex Analyst attend du modèle : métriques explicites, hiérarchies claires, grain maîtrisé.

**Décomposition du processus NLQ → SQL**
- Analyse de l'intention analytique.
- Sélection des dimensions et indicateurs.
- Choix des agrégations.
- Génération du SQL Snowflake.

**Causes typiques d'erreurs analytiques**
- Ambiguïtés sémantiques.
- Agrégations implicites.
- Modèles trop flexibles ou trop bruts.

**Travaux pratiques — Préparer et tester un modèle pour Cortex Analyst**
- Ajustement du cube existant : renommage, clarification des métriques, réduction des ambiguïtés.
- Tests de requêtes NLQ ciblées.
- Analyse du SQL généré par Cortex Analyst.
- Comparaison avec un SQL de référence.
