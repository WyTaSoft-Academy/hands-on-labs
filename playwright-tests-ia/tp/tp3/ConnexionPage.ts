import { Page, Locator } from '@playwright/test';

/**
 * TP 3 · le Page Object demande par l'enonce.
 *
 * Il decrit COMMENT se connecter. Il ne contient AUCUNE assertion metier :
 * c'est le test qui decide de ce qui doit etre vrai. Un Page Object qui
 * affirme des choses devient un second endroit ou chercher quand un test
 * echoue.
 */
export class ConnexionPage {
  readonly email: Locator;
  readonly motDePasse: Locator;
  readonly valider: Locator;
  readonly erreur: Locator;

  constructor(private readonly page: Page) {
    this.email = page.getByLabel('Adresse email');
    this.motDePasse = page.getByLabel('Mot de passe');
    this.valider = page.getByRole('button', { name: 'Se connecter' });
    this.erreur = page.getByRole('alert');
  }

  async aller() {
    await this.page.goto('/connexion');
  }

  async seConnecter(email: string, mdp: string) {
    await this.aller();
    await this.email.fill(email);
    await this.motDePasse.fill(mdp);
    await this.valider.click();
  }
}
