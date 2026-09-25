# Tester les agents Playwright avec Claude Code

Pas à pas après `npx playwright init-agents --loop claude`, lancé dans `mon-projet`.

---

## Ce que `init-agents` a installé

| Élément | Rôle |
|---|---|
| `.claude/agents/playwright-test-planner.md` | explore l'application et écrit un plan de test en Markdown |
| `.claude/agents/playwright-test-generator.md` | transforme un plan en fichiers `.spec.ts` |
| `.claude/agents/playwright-test-healer.md` | exécute les tests en échec et les répare |
| `.mcp.json` | déclare le serveur MCP `playwright-test` (`npx playwright run-test-mcp-server`) |
| `tests/seed.spec.ts` | le test de départ que les agents exécutent pour ouvrir une session |
| `specs/` | le dossier où le planner écrit ses plans |

### Le fichier `.mcp.json`

C'est lui qui branche Claude Code sur Playwright. Il est lu au démarrage de
`claude`, **dans le dossier où on le lance** :

```json
{
  "mcpServers": {
    "playwright-test": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "playwright",
        "run-test-mcp-server"
      ]
    }
  }
}
```

- `playwright-test` : le nom du serveur. Les outils qu'il expose s'appellent
  `mcp__playwright-test__…`, et ce sont eux que les trois agents déclarent
  dans leur en-tête `tools:`. Renommer le serveur, c'est casser les agents.
- `run-test-mcp-server` : le serveur MCP **du test runner**, et non celui de
  `npx playwright mcp`. Il exécute le seed, donc respecte `baseURL` et
  `webServer` de `playwright.config.ts`. En plus des outils `browser_*`, il
  fournit les outils propres à chaque agent : `planner_*`, `generator_*`, et
  `test_run`, `test_debug`, `test_list` pour le healer.
- `cmd /c` : l'enveloppe Windows. `npx` est un script `.cmd`, que Claude Code
  ne sait pas lancer directement. Sous macOS ou Linux, `init-agents` écrit
  `"command": "npx"` avec les arguments `playwright run-test-mcp-server`.

---

## 1. Installer les skills (facultatif)

```
npx playwright init-skills
```

## 2. Compléter le seed

Tel qu'il est généré, le seed ne fait rien. Les agents l'exécutent pour
démarrer une session : il doit au moins ouvrir l'application.

```ts
import { test, expect } from '@playwright/test';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    await page.goto('/');
  });
});
```

`baseURL` et `webServer` sont déjà réglés dans `playwright.config.ts` :
Playwright démarre la boutique tout seul.

## 3. Relancer Claude Code depuis `mon-projet`

```
cd formations/playwright-tests-ia/mon-projet
claude
```

- Au démarrage, Claude Code affiche « New MCP server found in this project:
  playwright-test ». Choisir **« Use this MCP server »**, la première option,
  en appuyant sur Entrée. Éviter « Use this and all future MCP servers », qui
  approuverait d'avance tout serveur ajouté plus tard au projet.
- `/mcp` : `playwright-test` doit apparaître comme connecté.
- `/agents` : les trois agents doivent être listés.

## 4. Tester la boucle planner → generator → healer

### Planner : écrire le plan du panier

Taper la demande directement dans la session Claude Code ouverte dans
`mon-projet`. Deux façons de faire.

**Mentionner l'agent avec `@`** (la plus sûre) : taper `@`, commencer à écrire
`playwright-test-planner` et choisir l'agent dans la liste.

```
@agent-playwright-test-planner Explore la boutique à partir de tests/seed.spec.ts
et écris un plan de test du panier dans specs/panier.md : ajout de produits,
retrait d'un produit, calcul du total, mise à jour du badge.
```

**Le demander en langage naturel :**

> Utilise l'agent playwright-test-planner pour explorer la boutique à partir de
> tests/seed.spec.ts et écrire un plan de test du panier (ajout, retrait, total,
> badge) dans specs/panier.md.

Ce qui se passe :

1. L'agent exécute le seed : `webServer` démarre la boutique et le navigateur
   s'ouvre sur `/`.
2. Il explore la page avec les outils du MCP `playwright-test`. Claude Code
   demande d'approuver chaque appel d'outil : accepter. Pour ne plus être
   sollicité pendant la démo, choisir l'option « don't ask again » pour ce
   serveur.
3. À la fin, il écrit `specs/panier.md` avec les scénarios du panier.

Avant de passer au generator, relire `specs/panier.md` et vérifier :

- les montants : clavier 49,00 €, souris 29,00 €, total 78,00 € ;
- la présence d'un scénario de retrait ;
- une vérification du badge.

S'il manque quelque chose, demander à l'agent de compléter le plan.

### Generator : transformer le plan en tests

Le generator produit **un fichier de test par scénario**. Pour chacun, il
rejoue les étapes dans le navigateur, puis écrit le `.spec.ts` à partir de ce
qu'il a réellement fait. Commencer par un seul scénario avant de lancer le plan
entier.

**Un seul scénario d'abord** (recommandé en démo) :

```
@agent-playwright-test-generator Génère le test du scénario 3.1
« Retrait d'un produit parmi plusieurs dans le panier » du plan specs/panier.md.
Enregistre-le dans tests/panier/retrait-produit-parmi-plusieurs.spec.ts.
```

**Puis une section entière :**

```
@agent-playwright-test-generator Génère les tests de la section 3
« Retrait de produits du panier » de specs/panier.md, un fichier par scénario,
dans tests/panier/.
```

**Ou tout le plan :**

```
@agent-playwright-test-generator Génère tous les tests du plan specs/panier.md,
un fichier par scénario, dans tests/panier/.
```

Le plan compte treize scénarios : c'est long et ça fait beaucoup
d'approbations d'outils. Réserver cette option à la préparation, pas au direct.

Ce qui se passe :

1. `generator_setup_page` exécute le seed : la boutique démarre et le
   navigateur s'ouvre.
2. L'agent clique et vérifie étape par étape. Accepter les appels d'outils
   `playwright-test`.
3. `generator_write_test` écrit le fichier, avec un commentaire avant chaque
   étape du plan.

Ensuite, lancer les tests générés :

```
npx playwright test tests/panier
```

Relire chaque fichier avec la checklist de l'étape 5. Si un test est rouge,
c'est le moment de passer au healer.

### Healer : réparer les tests en échec

Casser d'abord un sélecteur dans un test généré, par exemple
renommer « Ajouter au panier », puis :

> Utilise l'agent playwright-test-healer pour faire passer les tests qui
> échouent.

## 5. Relire ce qui a été généré

Appliquer la checklist du TP 2 :

- les valeurs attendues se recalculent à la main (49 € + 29 € = 78 €) ;
- aucune attente fixe (`waitForTimeout`) ;
- des assertions sur des **valeurs**, pas seulement sur la présence d'un élément ;
- le tableau du panier a une ligne d'en-tête : compter les `row` en conséquence ;
- le badge est vérifié avant de quitter la page : l'ajout part en arrière-plan,
  et partir trop tôt perd un article.

**Le healer répare des sélecteurs et des attentes. Il n'invente pas l'intention
métier.** Si un test ne dit pas ce qu'il vérifie, l'agent le rendra vert sans
le rendre juste.

---

## Dépannage

**`API Error: Unable to connect to API: SSL certificate hostname mismatch`**

Claude Code joint l'API, mais le certificat reçu ne correspond pas au bon nom
de domaine. Souvent, un proxy ou un antivirus intercepte la connexion HTTPS.

- Vérifier que `HTTPS_PROXY`, `HTTP_PROXY` ou `ANTHROPIC_BASE_URL` ne sont pas
  définies par erreur (`echo $env:HTTPS_PROXY` sous PowerShell).
- Couper l'inspection HTTPS de l'antivirus ou du proxy, ou tester sur un autre
  réseau (par exemple un partage de connexion) pour confirmer.
- Derrière un proxy d'entreprise avec son propre certificat racine :
  `$env:NODE_EXTRA_CA_CERTS="C:\chemin\ca-entreprise.pem"` avant de lancer
  `claude`.

**Le serveur MCP n'apparaît pas dans `/mcp`** : vérifier que `claude` a bien été
lancé depuis `mon-projet`, là où se trouve `.mcp.json`.
