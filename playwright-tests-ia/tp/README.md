# Les quatre TP, construits pas à pas

Chaque fichier est le test **à un moment de sa construction**. On les lit dans
l'ordre : l'étape s'ajoute, rien n'est réécrit. Le détail de chaque décision est
en tête du fichier concerné — c'est là qu'on le lit, en regardant le code.

```
node lancer.js tp              les quatre TP d'affilée
node lancer.js tp1             un seul, dans l'ordre des étapes
node lancer.js tp2 --ui        pour dérouler en restitution
```

Les slides correspondantes sont le deck
[`10-tp-pas-a-pas.html`](../../../slides/10-tp-pas-a-pas.html), à projeter **en
restitution**, jamais avant : le but est qu'ils cherchent d'abord.

## Ce qui est vert, et ce qui est rouge

Tous les scénarios finissent **verts**. Certains tests sont annotés
`test.fail()` : ils *doivent* échouer, et Playwright les compte comme réussis.
Ils apparaissent avec un `x` dans la sortie. C'est le mécanisme qui permet de
projeter un défaut sans casser la suite — et si l'un d'eux se mettait à passer,
Playwright dirait « Expected to fail, but passed », ce qui est exactement
l'information qu'on veut.

| Scénario | Tests | Durée |
|---|---|---|
| `node lancer.js tp1` | 6 verts | ~6 s |
| `node lancer.js tp2` | 9 verts, dont 4 échecs attendus | ~14 s |
| `node lancer.js tp3-etapes` | 13 verts, dont 3 échecs attendus | ~12 s |
| `node lancer.js tp4` | 9 verts | ~6 s |
| `node lancer.js tp4-navigateurs` | 6 verts sur 3 moteurs | ~18 s |

---

## TP 1 — Automatiser un parcours utilisateur simple

| Fichier | Ce qui s'ajoute | Ce qu'on y apprend |
|---|---|---|
| `tp1/etape-1-titre` | ouvrir, vérifier le titre | anatomie d'un test, `page`, `await` |
| `tp1/etape-2-recherche` | saisir et lancer une recherche | `getByLabel`, `getByRole`, assertion sur le **résultat** |
| `tp1/etape-3-ouvrir-fiche` | ouvrir le premier résultat | naviguer par un clic, `.first()` justifié |
| `tp1/etape-4-ajouter-panier` | ajouter au panier | **l'assertion qui attend** — le moment du TP |
| `tp1/etape-5-parcours-complet` | vérifier le panier | le corrigé, avec `test.step` |

**Les deux gestes qui ne sont pas des tests.** Installer :

```
mkdir mon-projet && cd mon-projet
npm init playwright@latest        # TypeScript, dossier tests, pas de workflow CI
npx playwright test               # le test d'exemple doit passer
```

**Créez ce projet en dehors de `demo/`.** À l'intérieur, `npm init` installe un
second Playwright, dans une autre version que celle du kit : les deux se
chargent dans le même processus et Playwright refuse de démarrer — les scénarios
`node lancer.js …` cessent alors de fonctionner, avec un message qui ne dit pas
d'où vient le problème.

Deux pièges de plus, dans le fichier généré :

- Le test d'exemple vise `playwright.dev` : **il demande un accès internet**.
  Derrière un proxy fermé, remplacez son `goto` par l'adresse locale.
- **`baseURL` et `webServer` y sont commentés.** Sans `baseURL`, `page.goto('/')`
  échoue sur `Cannot navigate to invalid URL` — c'est l'erreur numéro un de ce
  TP. Sans `webServer`, il faut lancer l'application à la main dans un autre
  terminal. Les décommenter est le premier geste :

```ts
use: { baseURL: 'http://localhost:3000' },

webServer: {
  command: 'node <chemin>/demo/app/serveur.js',
  url: 'http://localhost:3000/api/sante',
  reuseExistingServer: !process.env.CI,
  env: { DEMO_BANNIERE: '0' },   // sinon le bandeau rend les étapes 2 à 5 instables
},
```

Puis montrer les deux modes : `--ui` pour travailler, sans option pour ce qui
tournera en CI.

**Les trois décisions à commenter :** cibler par label plutôt que par `id` ;
vérifier le nombre de résultats **avant** `.first()` ; n'écrire **aucune**
attente pour le badge, malgré ses 350 ms.

---

## TP 2 — Créer et améliorer des tests avec l'IA

| Fichier | L'étape de l'énoncé |
|---|---|
| `tp2/etape-1-sans-ia` | remplacer les sélecteurs techniques par des locators par rôle et label |
| `tp2/etape-2-codegen` | enregistrer au Codegen, puis nettoyer — les deux versions passent |
| `tp2/etape-3-genere-par-ia` | le test généré, **sans le corriger**, avec le prompt qui a servi |
| `tp2/etape-4-apres-relecture` | le même après la checklist : quatre corrections |
| `tp2/etape-5-preuve` | casser l'application et vérifier que les tests deviennent rouges |
| `tp2/etape-6-troisieme-test` | le troisième test : un prompt complet pour un scénario neuf, retirer du panier |

L'étape 2 est celle qui surprend : **les deux versions sont vertes**, et l'une
ne vérifie rien. Vert ne veut pas dire bon.

L'étape 6 répond à la dernière consigne de l'énoncé : **un prompt complet pour
un troisième test**. Le prompt est en tête du fichier, à construire en direct un
bloc à la fois ; le bloc DOM se relève sur la page, il ne se tape pas. Piège du
scénario : le tableau du panier a une ligne d'en-tête, il reste donc **deux**
`row` après le retrait, pas une.

L'étape 5 casse l'application par interception réseau plutôt qu'en touchant au
serveur. Attention à ce qu'on croit casser : le catalogue est rendu par le
navigateur, mais le **total du panier est calculé par le serveur**. Fausser
`/api/produits` change donc l'affichage du catalogue et pas le total.

---

## TP 3 — Fiabiliser une suite de tests existante

Le point de départ reste `tp3-suite-instable/` (`node lancer.js tp3`), et le
corrigé d'un bloc reste `tp3-corrige/`. Le dossier `tp/tp3/` montre le chemin
**entre les deux**, un défaut à la fois.

| Fichier | La famille de défaut |
|---|---|
| `tp3/etape-1-le-bandeau` | le test instable : diagnostiquer, puis supprimer la **cause** |
| `tp3/etape-2-timing` | attentes fixes et lecture faite à la main |
| `tp3/etape-3-selecteurs` | style, position, technique — trois formes de fragilité |
| `tp3/etape-4-etat-partage` | la dépendance entre tests, le plus grave des trois |
| `tp3/etape-5-page-object` | restructurer, avec `ConnexionPage.ts` |
| `tp3/etape-6-preuve` | dix exécutions consécutives |

L'ordre n'est pas celui de l'énoncé par hasard : **le bandeau vient en premier**
parce que c'est le seul défaut qui échoue « une fois sur deux », donc le premier
qu'on remarque en lançant la suite plusieurs fois.

```
node lancer.js tp3-etapes --repeat-each=10     la preuve demandée en livrable
```

---

## TP 4 — Suite complète avec simulation d'API et CI

| Fichier | L'étape de l'énoncé |
|---|---|
| `tp4/etape-1-mocker` | trois mocks : nominal, liste vide, erreur 500 |
| `tp4/etape-2-fixture` | la fixture `pageConnectee`, utilisée par deux tests |
| `tp4/etape-3-authentifier-une-fois` | mesurer formulaire contre API, et l'avertissement `storageState` |
| `tp4/etape-4-multi-navigateurs` | le même fichier sur les trois moteurs |

**L'étape 5 de l'énoncé — la CI — ne produit pas de test mais un fichier.** Les
workflows prêts à copier sont dans [`../../ci/`](../../ci/) : `github-actions.yml`
et `gitlab-ci.yml`. Sans dépôt ni runner accessible :

```
node lancer.js ci-locale     rejoue la configuration de CI sur le poste
```

L'énoncé insiste sur la dernière étape, et il a raison : **une CI qui ne devient
jamais rouge ne protège de rien.** Cassez l'application, poussez, vérifiez le
rouge.
