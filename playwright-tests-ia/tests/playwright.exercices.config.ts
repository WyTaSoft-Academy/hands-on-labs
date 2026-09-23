import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration des exercices participants.
 *
 *   npx playwright test -c playwright.exercices.config.ts
 *   npx playwright test -c playwright.exercices.config.ts e1
 *   npx playwright test -c playwright.exercices.config.ts --ui
 *
 * Ou, plus simplement :  node lancer.js exercices
 */
export default defineConfig({
  testDir: './exercices',

  fullyParallel: true,
  retries: 0,
  timeout: 30_000,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3000',
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    trace: 'on',                      // la trace est un outil d'apprentissage
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },

  webServer: {
    command: 'node ../app/serveur.js',
    url: 'http://localhost:3000/api/sante',
    reuseExistingServer: true,
    timeout: 30_000,
    env: {
      DEMO_BANNIERE: process.env.DEMO_BANNIERE ?? '0',
      DEMO_LATENCE: process.env.DEMO_LATENCE ?? '350',
    },
  },
});
