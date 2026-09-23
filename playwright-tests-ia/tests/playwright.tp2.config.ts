import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration dediee au TP 2, variante B (sans assistant IA sur les postes).
 *
 *   node lancer.js tp2-variante-b
 *
 * Cinq tests « generes par IA » a critiquer et reecrire. Un seul worker et
 * aucun retry : on veut voir exactement ce que chacun fait, ou ne fait pas.
 * La trace est enregistree pour tous, y compris ceux qui passent — c'est la
 * seule facon de montrer qu'un test vert ne verifie parfois rien.
 */
export default defineConfig({
  testDir: '.',
  testMatch: ['**/tp2-variante-b/**/*.spec.ts'],

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
      DEMO_BANNIERE: '0',
      DEMO_LATENCE: '350',
    },
  },
});
