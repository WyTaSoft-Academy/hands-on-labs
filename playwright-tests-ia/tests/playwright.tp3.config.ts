import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration dediee au TP 3.
 *
 *   node lancer.js tp3
 *
 * Ce qui la distingue d'une configuration ordinaire :
 *   - le bandeau de consentement est ACTIF : c'est l'un des defauts a traiter
 *   - un seul worker, pour que les echecs soient lisibles
 *   - aucun retry : on veut voir l'instabilite, pas la masquer
 *   - trace systematique : c'est l'outil du TP
 */
export default defineConfig({
  testDir: '.',
  testMatch: ['**/tp3-suite-instable/**/*.spec.ts'],

  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3000',
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    trace: 'on',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },

  webServer: {
    command: 'node ../app/serveur.js',
    url: 'http://localhost:3000/api/sante',
    reuseExistingServer: false,
    timeout: 30_000,
    env: {
      DEMO_BANNIERE: '1',
      DEMO_LATENCE: '350',
    },
  },
});
