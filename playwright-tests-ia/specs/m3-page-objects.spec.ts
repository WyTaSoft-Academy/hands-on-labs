import { test, expect } from '../fixtures/test-base';

/**
 * MODULE 3 : Page Objects, test.step, tests pilotes par les donnees.
 * Ce fichier tourne dans le projet « client » : la session est deja ouverte.
 */

test('le panier affiche le total apres deux ajouts', async ({ catalogue, panier }) => {
  await catalogue.aller();
  await catalogue.ajouter('Clavier mécanique');
  await catalogue.ajouter('Souris ergonomique');

  await panier.aller();
  await expect(panier.total).toHaveText('78,00 €');
});

test('retirer un article met le total a jour', async ({ catalogue, panier }) => {
  await catalogue.aller();
  await catalogue.ajouter('Écran 27 pouces');
  await catalogue.ajouter('Tapis de souris XL');

  await panier.aller();
  await expect(panier.total).toHaveText('308,00 €');

  await panier.retirer('Tapis de souris XL');
  await expect(panier.total).toHaveText('289,00 €');
});

/** test.step : le rapport et la trace affichent les etapes nommees. */
test('commande complete, etape par etape', async ({ page, catalogue, panier }) => {
  await test.step('choisir deux articles', async () => {
    await catalogue.aller();
    await catalogue.ajouter('Webcam HD');
    await catalogue.ajouter('Support d\'écran');
  });

  await test.step('verifier le panier', async () => {
    await panier.aller();
    await expect(panier.total).toHaveText('118,00 €');
  });

  await test.step('passer la commande', async () => {
    await panier.commander();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vos commandes');
  });
});

/** Tests pilotes par les donnees : un cas par jeu de valeurs. */
const CAS = [
  { produit: 'Tapis de souris XL', total: '19,00 €' },
  { produit: 'Souris ergonomique', total: '29,00 €' },
  { produit: 'Support d\'écran', total: '39,00 €' },
  { produit: 'Clavier mécanique', total: '49,00 €' },
];

for (const cas of CAS) {
  test(`total du panier pour « ${cas.produit} »`, async ({ catalogue, panier }) => {
    await catalogue.aller();
    await catalogue.ajouter(cas.produit);

    await panier.aller();
    await expect(panier.total).toHaveText(cas.total);
  });
}
