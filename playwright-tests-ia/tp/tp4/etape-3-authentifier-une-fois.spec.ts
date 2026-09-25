import { test, expect } from '@playwright/test';

/**
 * TP 4 · ETAPE 3 — authentifier une fois, et mesurer le gain.
 *
 * L'enonce demande de mettre en place le projet « setup » et le storageState,
 * puis de MESURER le temps gagne. Les deux tests ci-dessous rendent la mesure
 * visible : comparez leurs durees dans la sortie.
 *
 * Ordre de grandeur mesure sur cette application : environ 300 ms par le
 * formulaire, environ 200 ms par l'API. L'ecart parait modeste parce que les
 * deux tests chargent ensuite la page et posent la meme assertion ; ce qui est
 * reellement economise, c'est le chargement du formulaire et trois
 * interactions. Faites la mesure devant eux plutot que d'annoncer un chiffre :
 * il depend de l'application, et sur une vraie authentification d'entreprise
 * l'ecart se compte en secondes.
 *
 * Le second gain ne se mesure pas en temps : une refonte du formulaire ne fait
 * plus echouer les vingt tests qui ne parlent pas de connexion.
 *
 * LE VRAI storageState est deja en place dans le projet, et il vaut mieux le
 * montrer la que le reconstruire ici :
 *
 *   auth.setup.ts                    produit .auth/client.json
 *   playwright.config.ts             projet « setup », puis
 *                                    projet « avec-session » qui en depend
 *   specs/m4-storagestate.spec.ts    les tests qui l'utilisent
 *
 * L'AVERTISSEMENT QUI COMPTE, et qui explique pourquoi le reste du projet ne
 * l'utilise pas : cette application garde le panier en SESSION SERVEUR.
 * Partager un storageState, c'est partager la session, donc le panier — et
 * deux tests paralleles se marchent dessus. C'est exactement le defaut « etat
 * partage » du module 3, recree par une bonne intention.
 *
 * La regle : storageState pour des tests EN LECTURE SEULE ; une session par
 * test des qu'il ecrit.
 *
 * Et dans tous les cas : .auth/ contient des sessions valides. Au .gitignore,
 * sans exception.
 */

test('connexion par le formulaire', async ({ page }) => {
  await page.goto('/connexion');
  await page.getByLabel('Adresse email').fill('client@demo.test');
  await page.getByLabel('Mot de passe').fill('demo');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await expect(page.getByTestId('utilisateur')).toHaveText('Marie DUPONT');
});

test('connexion par API', async ({ page }) => {
  const r = await page.request.post('/api/connexion', {
    data: { email: 'client@demo.test', mdp: 'demo' },
  });
  expect(r.ok()).toBeTruthy();

  await page.goto('/');
  await expect(page.getByTestId('utilisateur')).toHaveText('Marie DUPONT');
});
