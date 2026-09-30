# Quiz du module 4 : explications pour Carine

Bonjour Carine,

Merci pour ton message, et bravo d'être allée au bout du quiz. Voici les explications
pour les deux questions que tu cites, avec pour chacune l'endroit exact dans les
supports de la formation et le lien vers la documentation officielle.

Tu parles de **trois** erreurs, mais ton message n'en détaille que deux : envoie-moi la
troisième question, je te réponds de la même façon.

---

## Question 4 — Préparer les données d'un test

> **Quelle règle la formation donne-t-elle pour préparer les données d'un test ?**
>
> Ta réponse : *b) Réutiliser un jeu de données commun, créé une fois pour toute la suite.*

### La bonne réponse

**Chaque test crée lui-même les données dont il a besoin, par l'API, avec des identifiants
uniques.** On passe par l'interface uniquement pour ce que le test vérifie ; tout le reste
se prépare par des appels API.

### Pourquoi la réponse b) est un piège

Un jeu de données commun paraît économique : on le crée une fois, et tous les tests s'en
servent. C'est pourtant ce qui fait mourir une suite de tests, pour trois raisons.

1. **Les tests deviennent dépendants les uns des autres.** Si un test modifie le compte
   partagé (il change son adresse, il vide son panier), le test suivant ne trouve plus ce
   qu'il attend. Un échec dans un test en fait échouer d'autres, qui n'ont rien à voir.
2. **Le parallélisme devient impossible.** Playwright lance les tests en parallèle
   (`fullyParallel: true`). Deux tests qui utilisent au même moment le même compte se
   marchent dessus, et l'échec apparaît « une fois sur trois », sans cause visible : c'est
   la définition d'un test instable.
3. **On ne peut plus relancer un test seul.** Si le test « modifier le compte » suppose que
   le test « créer le compte » est passé avant, le relancer isolément échoue.

Playwright t'aide déjà : **chaque test reçoit un contexte de navigateur neuf**, donc ni
cookies ni `localStorage` hérités. Ce qui reste partagé, c'est la base de données de
l'application. C'est à toi de ne pas y partager d'état entre les tests.

### Ce que ça donne dans le code

```ts
test('affiche l\'historique des commandes', async ({ page, request }) => {
  // Préparation : deux appels API, moins d'une seconde.
  // L'adresse est unique : aucun autre test ne peut utiliser ce compte.
  const u = await request.post('/api/utilisateurs', {
    data: { email: `u-${Date.now()}@test.fr` },
  });
  const { id } = await u.json();
  await request.post('/api/commandes', {
    data: { utilisateur: id, montant: 49 },
  });

  // Le test proprement dit : c'est la seule partie qui passe par l'interface.
  await page.goto(`/utilisateurs/${id}/commandes`);
  await expect(page.getByRole('listitem')).toHaveCount(1);
});
```

Deux gains, au-delà de l'isolation :

- **la vitesse** : un test qui crée son compte, son panier et sa commande par l'interface
  prend des dizaines de secondes ; par l'API, moins d'une seconde ;
- **la clarté de l'échec** : si le test échoue, c'est sur l'historique des commandes, pas
  parce qu'un bouton de création de compte a changé de place.

Un détail utile : la fixture `request` partage les cookies du contexte de la page. Une fois
connecté, les appels API le sont aussi.

### Où c'est dans les supports

| Support | Slide | Ce qu'on y trouve |
|---|---|---|
| Module 4, `04-industrialiser` | **6** — « Préparer sans cliquer : créer les données par l'API » | La règle : *testez par l'interface ce que vous vérifiez, préparez par l'API tout le reste*, et l'exemple ci-dessus |
| Module 3, `03-structurer-deboguer` | **7** — « La règle d'or : l'isolation des tests » | Pourquoi chaque test doit pouvoir tourner seul, dans n'importe quel ordre, en parallèle des autres |
| Module 3, annexe | **29** — « D'où viennent les données de vos tests » | Les quatre approches comparées : comptes partagés, copie de production, jeu de référence rechargé, **création à la demande**. La réponse b) correspond aux deux premières, celles qui cassent le plus |

L'exercice 18 de la série de la formation, « Préparer par API », met la règle en pratique.

### Dans la documentation officielle de Playwright

- **Bonnes pratiques, isolation des tests** :
  <https://playwright.dev/docs/best-practices#make-tests-as-isolated-as-possible>
- **Créer les préconditions d'un test par l'API**, avant de passer par l'interface :
  <https://playwright.dev/docs/api-testing#establishing-preconditions>
- **Isolation par contexte de navigateur** : <https://playwright.dev/docs/browser-contexts>

---

## Question 11 — Faire échouer la CI dès qu'un retry a rattrapé un test

> **Quel drapeau fait échouer la CI dès qu'un retry a rattrapé un test ?**

### La bonne réponse

**`--fail-on-flaky-tests`**, une option de la ligne de commande de Playwright :

```
npx playwright test --fail-on-flaky-tests
```

Son équivalent dans `playwright.config.ts` est `failOnFlakyTests: true`.

### Le mécanisme, pas à pas

1. **Les retries.** En CI, la configuration de la formation relance un test en échec
   jusqu'à deux fois (`retries: process.env.CI ? 2 : 0`). C'est un amortisseur : un
   incident réseau passager ne bloque pas une livraison.
2. **Un test « flaky ».** Si un test échoue au premier essai puis passe au deuxième,
   Playwright le marque **flaky** (instable). Par défaut, il le compte comme réussi : la
   CI reste **verte**.
3. **Le problème.** Une CI verte, personne ne la regarde. Le test instable reste instable,
   d'autres s'y ajoutent, et au-delà d'environ 2 % de tests instables l'équipe relance par
   réflexe : la suite a cessé d'être un signal.
4. **Le drapeau.** Avec `--fail-on-flaky-tests`, un test rattrapé par un retry fait
   **échouer** l'exécution : la CI devient **rouge**. Les retries gardent leur utilité —
   la trace du premier échec est enregistrée —, mais ce qui a été rattrapé ne peut plus
   passer inaperçu.

La formation résume : ce drapeau transforme « quelqu'un devrait regarder » en « la CI est
rouge ».

### Et GitLab CI/CD dans tout ça ?

C'est le point qui prête à confusion : **ce drapeau n'est pas une option de GitLab**, c'est
une option de Playwright. GitLab ne voit qu'une chose, le **code de sortie** de la commande
lancée dans le job : 0, le job est vert ; autre chose, il est rouge. Le drapeau agit sur ce
code de sortie.

Tu ne le trouveras donc pas dans la documentation de GitLab. Il s'ajoute simplement à la
ligne `script:` du job. Dans le fichier fourni avec la formation
(`demo/ci/gitlab-ci.yml`) :

```yaml
tests-e2e:
  stage: test
  image: mcr.microsoft.com/playwright:v1.63.0-noble
  variables:
    CI: "true"
  script:
    - npx playwright test --fail-on-flaky-tests
  artifacts:
    when: always
    paths:
      - demo/tests/playwright-report/
    reports:
      junit: demo/tests/resultats.xml
```

La formation recommande de réserver cette exigence à la **branche principale** : sur une
branche de travail, on veut pouvoir avancer même si un test est instable. Le plus simple
est de le décider dans la configuration Playwright, avec les variables que GitLab fournit
à chaque job :

```ts
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  // rouge sur la branche principale dès qu'un retry a rattrapé un test
  failOnFlakyTests: process.env.CI_COMMIT_BRANCH === process.env.CI_DEFAULT_BRANCH,
});
```

**Attention à ne pas confondre** avec le mot-clé `retry:` de GitLab. Celui-là relance
**tout le job** quand il échoue, et il masque encore davantage l'instabilité : à éviter pour
des tests instables. Les retries dont parle la question sont ceux de Playwright, test par
test.

### Où c'est dans les supports

| Support | Slide | Ce qu'on y trouve |
|---|---|---|
| Module 4, `04-industrialiser` | **20** — « Gouvernance de la suite : traiter l'instabilité plutôt que la subir » | Les quatre étapes (mesurer, rendre visible, fixer une règle, interdire la rustine), le seuil des 2 %, le rôle des retries et `--fail-on-flaky-tests` |

### Dans les documentations officielles

Côté **Playwright**, là où se trouve la réponse :

- **L'option en ligne de commande** : <https://playwright.dev/docs/test-cli>
  (chercher `--fail-on-flaky-tests`)
- **L'option de configuration** :
  <https://playwright.dev/docs/api/class-testconfig#test-config-fail-on-flaky-tests>
- **Les retries et les tests « flaky »** : <https://playwright.dev/docs/test-retries>

Côté **GitLab CI/CD**, pour le contexte :

- **Les variables prédéfinies** (`CI_COMMIT_BRANCH`, `CI_DEFAULT_BRANCH`) :
  <https://docs.gitlab.com/ci/variables/predefined_variables/>
- **Le mot-clé `retry:`**, pour voir la différence : <https://docs.gitlab.com/ci/yaml/#retry>
- **L'affichage des résultats de tests JUnit** dans les merge requests :
  <https://docs.gitlab.com/ci/testing/unit_test_reports/>

---

## En résumé

| Question | Réponse | Où la retrouver |
|---|---|---|
| 4 | Chaque test crée ses propres données, par l'API, avec des identifiants uniques. Jamais un jeu partagé entre les tests | Module 4, slide 6 ; module 3, slides 7 et 29 |
| 11 | `--fail-on-flaky-tests` (ou `failOnFlakyTests: true`), une option de Playwright, pas de GitLab | Module 4, slide 20 |

Le quiz peut se refaire autant de fois que tu le souhaites :
<https://www.wytasoft.com/quizz/playwright-tests-ia-module-4-fr>.

N'hésite pas si un point reste flou, et envoie-moi la troisième question.

Bonne continuation,

Mehdi
