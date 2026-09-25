import { test, expect } from '@playwright/test';
import { ConnexionPage } from './ConnexionPage';

/**
 * TP 3 · ETAPE 5 — restructurer : la connexion dans un Page Object.
 *
 * Le parcours de connexion apparaissait dans trois tests, recopie a chaque
 * fois. Ce n'est pas une question d'esthetique : le jour ou le formulaire
 * gagne un champ, il faut le corriger a trois endroits, et on en oublie un.
 *
 * LA LIGNE A NE PAS FRANCHIR : le Page Object decrit COMMENT interagir, jamais
 * ce qui doit etre vrai. Les assertions restent dans les tests. Un Page Object
 * qui assure lui-meme devient un second endroit ou chercher quand ca casse.
 *
 * Voir ConnexionPage.ts, dans ce dossier.
 */

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: 'consent', value: '1', domain: 'localhost', path: '/' },
  ]);
});

test('la connexion affiche le nom de l\'utilisateur', async ({ page }) => {
  const connexion = new ConnexionPage(page);

  await connexion.seConnecter('client@demo.test', 'demo');

  await expect(page.getByTestId('utilisateur')).toHaveText('Marie DUPONT');
  await expect(page.getByRole('link', { name: 'Se déconnecter' })).toBeVisible();
});

test('la connexion refuse un mot de passe incorrect', async ({ page }) => {
  const connexion = new ConnexionPage(page);

  await connexion.seConnecter('client@demo.test', 'mauvais');

  await expect(connexion.erreur).toHaveText('Identifiants incorrects');
});

/**
 * Le gain se voit ici : le test parle de commande, pas de formulaire. La
 * connexion tient en une ligne, et la preparation du panier passe par l'API.
 */
test('commander vide le panier et cree la commande', async ({ page }) => {
  const connexion = new ConnexionPage(page);
  await connexion.seConnecter('client@demo.test', 'demo');

  await page.request.post('/api/panier', { data: { id: 1 } });

  await page.goto('/panier');
  await expect(page.getByTestId('total-panier')).toHaveText('49,00 €');

  await page.getByRole('button', { name: 'Commander' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vos commandes');
  await expect(page.getByRole('row')).not.toHaveCount(0);
});
