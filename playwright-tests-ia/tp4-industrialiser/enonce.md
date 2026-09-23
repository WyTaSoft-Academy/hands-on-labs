# TP 4 — Suite complète avec simulation d'API et intégration continue

**≈ 70 minutes · en binôme · module 4 · synthèse des deux jours**

Vous travaillez dans `mon-projet/`, le projet des TP 1 et 2.

## Déroulé

1. **Mocker** : écrivez trois tests qui simulent la réponse de `GET /api/produits` :
   le cas nominal, la liste vide, l'erreur 500.
2. **Factoriser** : créez une fixture `pageConnectee` et faites-la utiliser par au
   moins deux tests. La connexion se fait par `POST /api/connexion`.
3. **Authentifier une fois** : mettez en place le projet `setup` et le
   `storageState`, mesurez le temps gagné.
4. **Élargir** : ajoutez les projets Firefox et WebKit, lancez la campagne
   complète, traitez les écarts.

   ```
   npx playwright install firefox webkit
   ```
5. **Automatiser** : écrivez le workflow CI (GitHub Actions ou GitLab CI),
   poussez, vérifiez qu'il tourne et que le rapport est bien publié en artefact.
6. **Prouver** : cassez volontairement l'application, poussez, vérifiez que la
   CI passe au rouge.

La dernière étape est la plus importante : une CI qui ne devient jamais rouge ne
protège de rien.

## Livrable

Un dépôt avec une suite structurée, des mocks, une fixture d'authentification,
trois navigateurs configurés et un pipeline CI vert.

## À mesurer

Notez le temps d'exécution avant et après le `storageState`, et avec un puis
quatre workers. Ces chiffres vous serviront à argumenter au retour.

| Mesure | Durée |
|---|---|
| Sans `storageState` | |
| Avec `storageState` | |
| 1 worker | |
| 4 workers | |

## Pour la CI

Créez un dépôt à partir de `mon-projet/` et **copiez-y `app/serveur.js`** :
la CI ne voit que votre dépôt. Adaptez la `command` du `webServer` à ce nouveau
chemin — il démarre alors l'application en CI comme en local. Pensez à `npm ci`, à
`npx playwright install --with-deps`, et à publier `playwright-report/` en
artefact **même quand les tests échouent**.
