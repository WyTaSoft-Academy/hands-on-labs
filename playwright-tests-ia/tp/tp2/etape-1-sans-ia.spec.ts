import { test, expect } from '@playwright/test';

/**
 * TP 2 · ETAPE 1 — sans IA : remplacer les selecteurs techniques.
 *
 * On reprend le test du TP 1 et on remplace tout ce qui vise le BALISAGE par
 * des locators qui visent ce que PERCOIT l'utilisateur : role, label, texte.
 *
 * Ce que le test du TP 1 aurait pu contenir, ecrit par reflexe :
 *
 *   await page.locator('#q').fill('clavier');
 *   await page.locator('form.recherche button').click();
 *   await page.locator('ul.produits li:nth-child(1) a').click();
 *
 * Ces trois lignes FONCTIONNENT aujourd'hui. C'est ce qui les rend
 * dangereuses : rien ne signale leur fragilite tant que le balisage ne bouge
 * pas. La version ci-dessous dit la meme chose et survit a une refonte.
 */

test('la recherche puis la fiche, en ciblant ce que voit l\'utilisateur', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Rechercher un produit').fill('clavier');
  await page.getByRole('button', { name: 'Rechercher' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(1);

  await page.getByRole('listitem').first().getByRole('link').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Clavier mécanique');
});

/**
 * La demonstration que « ca marche aujourd'hui » ne suffit pas.
 *
 * La classe CSS des boutons est REGENEREE a chaque demarrage du serveur. Un
 * selecteur qui s'y accroche est deja mort, et il l'etait des l'ecriture.
 *
 * test.fail() documente le comportement : ce test DOIT echouer. S'il passait,
 * Playwright le signalerait — c'est une assertion sur l'application, pas un
 * test desactive.
 */
test.fail('un selecteur accroche au style ne survit pas au redemarrage', async ({ page }) => {
  await page.goto('/');

  // 1,5 s suffit : on veut constater l'absence, pas attendre le timeout complet.
  await expect(page.locator('.css-a1b2c3')).toHaveCount(1, { timeout: 1500 });
});
