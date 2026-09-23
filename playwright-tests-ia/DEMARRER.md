# Démarrer

Dix minutes, à faire une fois, au début de la formation. Chaque étape se
termine par un contrôle : ne passez à la suivante que s'il est bon.

## 1. Vérifier les outils

```
node -v          # v18 ou plus
git --version
```

Node absent ou trop ancien : installez la version LTS depuis <https://nodejs.org>,
puis **rouvrez le terminal**.

## 2. Récupérer les TP

```
git clone https://github.com/WyTaSoft-Academy/hands-on-labs.git
cd hands-on-labs/playwright-tests-ia
```

Sans Git : sur la page du dépôt, **Code → Download ZIP**, décompressez, puis
ouvrez un terminal dans le dossier `playwright-tests-ia`.

✅ `dir` (ou `ls`) affiche `app`, `tests` et les quatre dossiers `tp…`.

## 3. Installer Playwright

```
cd tests
npm install
npx playwright install chromium
```

Chromium suffit jusqu'au TP 3. Firefox et WebKit s'installent au TP 4.

✅ `npx playwright --version` affiche `Version 1.63.0`.

## 4. Vérifier l'application

```
node ../app/serveur.js
```

Ouvrez <http://localhost:3000> : la **Boutique interne** s'affiche. Connectez-vous
avec `client@demo.test`, mot de passe `demo`.

✅ Le catalogue est visible. Puis **Ctrl+C** dans le terminal pour arrêter
l'application : les tests la démarrent eux-mêmes.

## 5. Vérifier que tout tourne

```
node lancer.js exercices
```

✅ `33 skipped`. Les exercices sont en attente : c'est l'état de départ attendu.

Vous êtes prêt. Pour travailler sur les exercices :

```
node lancer.js exercices --ui
```

Pour le TP 1, suivez [`tp1-premier-parcours/enonce.md`](tp1-premier-parcours/enonce.md).

---

## Si ça bloque

| Symptôme | Remède |
|---|---|
| PowerShell : `npm.ps1 cannot be loaded because running scripts is disabled` | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, ou travaillez dans **cmd** |
| `npx playwright install` échoue ou reste bloqué | Proxy d'entreprise : prévenez le formateur, un cache de navigateurs est prévu |
| `EADDRINUSE` ou tests qui échouent sans raison | Le port 3000 est occupé : fermez l'application lancée à la main (Ctrl+C) |
| `Playwright was loaded twice` | Un projet a été créé **dans** `tests/` : déplacez-le à côté |
| `Cannot navigate to invalid URL` | `baseURL` est resté commenté dans votre `playwright.config.ts` |

Sous PowerShell, pour trouver ce qui occupe le port 3000 :

```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
Stop-Process -Id <PID>
```
