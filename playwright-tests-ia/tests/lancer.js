#!/usr/bin/env node
/**
 * Lanceur des exercices et des TP.
 *
 * Il existe parce que « VAR=1 npx playwright test » ne fonctionne pas sous
 * PowerShell ni sous cmd. Ici, la meme commande marche partout :
 *
 *   node lancer.js                      liste les scenarios
 *   node lancer.js exercices --ui       les exercices, en mode UI
 *   node lancer.js tp2-variante-b       le TP 2 sans assistant IA
 *   node lancer.js tp3                  la suite instable du TP 3
 *
 * Toute option supplementaire est transmise a Playwright :
 *   node lancer.js tp3 --repeat-each=10
 */
'use strict';

const { spawn } = require('child_process');

const SCENARIOS = {
  tp3: {
    description: 'TP 3 : la suite volontairement instable',
    args: ['test', '-c', 'playwright.tp3.config.ts', 'tp3-suite-instable'],
    env: {},
  },
  exercices: {
    description: 'Les exercices participants (squelettes a completer)',
    args: ['test', '-c', 'playwright.exercices.config.ts'],
    env: {},
  },
  'exercices-banniere': {
    description: 'Les exercices avec le bandeau imprevisible actif',
    args: ['test', '-c', 'playwright.exercices.config.ts'],
    env: { DEMO_BANNIERE: '1' },
  },
  'tp2-variante-b': {
    description: 'TP 2 variante B : tests « generes par IA » a critiquer',
    args: ['test', '-c', 'playwright.tp2.config.ts'],
    env: {},
  },
};

const nom = process.argv[2];

if (!nom || !SCENARIOS[nom]) {
  console.log('\nScenarios disponibles :\n');
  for (const [cle, s] of Object.entries(SCENARIOS)) {
    console.log('  ' + cle.padEnd(20) + s.description);
  }
  console.log('\nExemple :  node lancer.js exercices --ui\n');
  process.exit(nom ? 1 : 0);
}

const scenario = SCENARIOS[nom];
const args = [...scenario.args, ...process.argv.slice(3)];

console.log(`\n> playwright ${args.join(' ')}`);
for (const [k, v] of Object.entries(scenario.env)) console.log(`  ${k}=${v}`);
console.log('');

// On appelle le CLI de Playwright directement plutot que npx : sous Windows,
// spawn refuse un fichier .cmd sans shell, et Node 24 est strict la-dessus.
const cli = require.resolve('@playwright/test/cli');

const enfant = spawn(
  process.execPath,
  [cli, ...args],
  { stdio: 'inherit', env: { ...process.env, ...scenario.env } },
);

enfant.on('exit', (code) => process.exit(code ?? 1));
