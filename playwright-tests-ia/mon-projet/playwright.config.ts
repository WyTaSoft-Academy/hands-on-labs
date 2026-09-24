import { defineConfig, devices } from '@playwright/test';

/**
 * TP 1 — la configuration generee par « npm init playwright@latest »,
 * completee des trois reglages dont les tests du TP ont besoin.
 *
 * Ce qui a change par rapport au fichier d'origine :
 *
 *   1. baseURL      il etait COMMENTE. C'est lui qui manquait : sans baseURL,
 *                   page.goto('/') n'a rien contre quoi se resoudre, et
 *                   Playwright repond « Cannot navigate to invalid URL ».
 *
 *   2. webServer    il etait COMMENTE lui aussi. Playwright demarre et arrete
 *                   l'application tout seul : plus besoin d'un second terminal,
 *                   et c'est ce meme reglage qui rendra le pipeline de CI si
 *                   court au module 4.
 *
 *   3. projects     reduit a Chromium. Le fichier genere en declare trois, donc
 *                   chaque test tournerait trois fois et exigerait trois
 *                   moteurs telecharges. Firefox et WebKit arrivent au TP 4.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // « open: never » evite qu'un serveur de rapport reste ouvert en arriere-plan
  // apres chaque echec. Avec 'html' seul, c'est le comportement par defaut.
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: {
    // Chemin relatif A CE FICHIER, vers l'application de demonstration.
    command: 'node ../demo/app/serveur.js',
    url: 'http://localhost:3000/api/sante',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      // Le bandeau de consentement est ACTIF par defaut cote serveur : il faut
      // l'eteindre explicitement, sinon il recouvre la page a un instant
      // aleatoire et les etapes 2 a 5 deviennent instables. Il est le sujet du
      // TP 3, pas du TP 1.
      DEMO_BANNIERE: '0',
      DEMO_LATENCE: '350',
    },
  },
});
