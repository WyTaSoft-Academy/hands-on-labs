# Exercices participants

25 exercices sur l'application **Boutique interne**, du plus simple au plus difficile.
Vous les faites au fil des deux journées : chaque niveau suit un module.

## Démarrer

Une fois, au début :

```
cd playwright-tests-ia/tests
npm install
npx playwright install chromium
```

Puis, pour travailler :

```
node lancer.js exercices --ui
```

Le mode UI relance vos tests à chaque sauvegarde et montre le DOM à chaque étape.
C'est là que vous passerez le plus clair de votre temps.

Sans interface, pour un fichier précis :

```
node lancer.js exercices e1
node lancer.js exercices -g "e5"
```

L'application est démarrée et arrêtée automatiquement. Pour l'ouvrir dans votre
navigateur pendant que vous cherchez : `node ../app/serveur.js` puis
<http://localhost:3000>.

## Comment travailler

Chaque exercice est un test **désactivé**. Retirez le `.skip`, écrivez le code,
relancez. Au démarrage, les 33 tests sont en attente ; votre progression se lit
au nombre de tests verts.

```
test.skip('e1 · ...', async ({ page }) => {     →     test('e1 · ...', async ({ page }) => {
```

Les énoncés sont dans les fichiers eux-mêmes, juste au-dessus de chaque test,
avec des indices gradués. Les corrigés sont présentés en séance.

## Le parcours

| Fichier | Niveau | Exercices | Module |
|---|---|---|---|
| `e1-premiers-pas.spec.ts` | ★☆☆☆☆ à ★★☆☆☆ | 1 à 5 | 1 |
| `e2-selecteurs-assertions.spec.ts` | ★★☆☆☆ à ★★★☆☆ | 6 à 10 | 2 |
| `e3-parcours-structure.spec.ts` | ★★★☆☆ à ★★★★☆ | 11 à 15 | 3 |
| `e4-industrialisation.spec.ts` | ★★★☆☆ à ★★★★☆ | 16 à 20 | 4 |
| `e5-defis.spec.ts` | ★★★★☆ à ★★★★★ | 21 à 25 | 3, 4 et annexes |

### Détail

| # | Exercice | Difficulté | Ce que vous y apprenez |
|---|---|---|---|
| 1 | La page d'accueil | ★☆☆☆☆ | `goto`, `toHaveTitle`, `getByRole('heading')` |
| 2 | Compter et lire | ★☆☆☆☆ | `toHaveCount`, `getByTestId`, pourquoi une assertion réessaie |
| 3 | La recherche | ★★☆☆☆ | `getByLabel`, `fill`, cas passant et cas vide |
| 4 | Fiche produit | ★★☆☆☆ | Naviguer par un clic plutôt que par une URL |
| 5 | Ajouter au panier | ★★☆☆☆ | L'auto-wait sur une mise à jour différée de 350 ms |
| 6 | Réparer des sélecteurs fragiles | ★★☆☆☆ | Diagnostiquer trois défauts et réécrire |
| 7 | Le mode strict | ★★★☆☆ | Lever une ambiguïté de quatre façons |
| 8 | Produit indisponible | ★★☆☆☆ | `toBeDisabled`, l'état plutôt que l'apparence |
| 9 | Le panier | ★★★☆☆ | Compter des lignes, viser une ligne de tableau |
| 10 | Le piège de la lecture manuelle | ★★★☆☆ | Pourquoi `textContent()` échoue là où `expect` réussit |
| 11 | Un parcours complet | ★★★☆☆ | Enchaîner ajout, retrait, vérification |
| 12 | Connexion, les deux cas | ★★★☆☆ | Tester aussi l'échec, `role="alert"` |
| 13 | Écrire un Page Object | ★★★★☆ | Séparer interactions et assertions |
| 14 | Un test par jeu de données | ★★★☆☆ | Générer des tests depuis un tableau |
| 15 | Découper un parcours long | ★★★★☆ | `test.step`, lisibilité du rapport |
| 16 | Simuler un catalogue vide | ★★★☆☆ | `page.route`, `route.fulfill` |
| 17 | Simuler une panne | ★★★☆☆ | Erreur 500, `route.abort`, robustesse de la page |
| 18 | Préparer par API | ★★★☆☆ | `page.request`, gagner du temps |
| 19 | Écrire une fixture | ★★★★☆ | `base.extend`, préparation et nettoyage |
| 20 | Contrôler un document produit | ★★★★☆ | Téléchargement, contenu, encodage |
| 21 | Deux utilisateurs en simultané | ★★★★★ | Deux contextes, circuit de validation |
| 22 | Habilitations | ★★★★☆ | Tester l'accès refusé, et le visiteur anonyme |
| 23 | Le bandeau qui surgit | ★★★★★ | `addLocatorHandler`, ou supprimer la cause |
| 24 | Contrôles de sécurité | ★★★★☆ | En-têtes HTTP, absence de secret |
| 25 | Défi libre | ★★★★★ | Choisir vous-même ce qui mérite un test |

## Les règles du jeu

Elles s'appliquent à tous les exercices, et ce sont celles que vous emporterez.

1. **Aucun `waitForTimeout`**, aucun timeout augmenté. Si vous en avez envie,
   c'est que la cause n'est pas trouvée.
2. **Aucun sélecteur CSS ni XPath.** Ciblez par rôle, label ou texte. Le
   `data-testid` quand rien d'autre ne convient.
3. **Une assertion au moins par test**, et elle porte sur un comportement,
   pas sur la présence d'une page.
4. **Chaque test tourne seul**, dans n'importe quel ordre. Il crée l'état dont
   il a besoin.
5. **Un nom de test décrit un comportement**, pas une manipulation.
   « e11 · ajouter puis retirer met le total à jour », pas « test panier ».
6. **Faites échouer vos tests.** Cassez volontairement une assertion ou
   l'application : si le test reste vert, il ne vérifie rien.

## Les données de l'application

| id | Produit | Catégorie | Prix | Stock |
|---|---|---|---|---|
| 1 | Clavier mécanique | Périphériques | 49,00 € | 12 |
| 2 | Souris ergonomique | Périphériques | 29,00 € | 30 |
| 3 | Écran 27 pouces | Affichage | 289,00 € | 4 |
| 4 | Casque antibruit | Audio | 159,00 € | **0** |
| 5 | Station d'accueil | Périphériques | 189,00 € | 7 |
| 6 | Webcam HD | Audio | 79,00 € | 15 |
| 7 | Support d'écran | Affichage | 39,00 € | 22 |
| 8 | Tapis de souris XL | Périphériques | 19,00 € | 40 |

**Comptes** : `client@demo.test` et `responsable@demo.test`, mot de passe `demo`.

**Règle métier** : une commande dépassant 1000 € part en « En attente de
validation » et doit être validée par un responsable.

**Identifiants de test**, par écran :

| Écran | Identifiants |
|---|---|
| En-tête | `badge-panier`, `utilisateur` |
| Catalogue | `catalogue`, `prix-<id>`, `ajouter-<id>` |
| Fiche produit | `prix`, `stock`, `confirmation` |
| Panier | `total-panier` |
| Commandes | `commande-nouvelle`, `commande-<id>`, `statut-<id>` |
| Validations | `validation-<id>` |

**Points d'API** : `GET /api/produits`, `POST|GET|DELETE /api/panier`,
`POST /api/connexion`, `POST|GET /api/commandes`, `GET /api/export.csv`.

## Deux particularités volontaires de l'application

Elles ne sont pas des bugs : elles servent les exercices.

- Le **badge du panier** se met à jour **350 ms** après le clic. C'est ce qui
  rend l'exercice 10 possible.
- La **classe CSS des boutons est régénérée à chaque démarrage** du serveur.
  Un sélecteur qui s'y accroche marche aujourd'hui et casse demain. C'est le
  sujet de l'exercice 6.
- Un **bandeau de consentement bloquant** peut apparaître entre 60 et 760 ms.
  Il est désactivé par défaut. Activez-le pour l'exercice 23 :
  `node lancer.js exercices-banniere`. Plusieurs de vos tests deviendront
  intermittents : c'est exactement à cela que ressemble un test *flaky*.

## La fiche de secours

Si la syntaxe vous freine plus que la logique du test, gardez ouverte la
[fiche JavaScript](../../FICHE-JAVASCRIPT.md) : imports, `async`/`await`,
déstructuration, et la lecture d'un message d'erreur.

## Si vous bloquez

1. Ouvrez la **trace** : elle est enregistrée pour tous les exercices.
   `npx playwright show-trace test-results/.../trace.zip`
2. Lisez le **journal d'appels** du message d'erreur. La ligne
   *locator resolved to* dit si l'élément a été trouvé. Si elle manque,
   le problème est le sélecteur, pas la valeur.
3. Utilisez **Pick locator** dans le mode UI pour obtenir le bon locator.
4. Demandez. Un exercice bloqué plus de dix minutes ne vous apprend plus rien.
