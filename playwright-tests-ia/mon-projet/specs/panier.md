# Plan de test - Panier

## Application Overview

Boutique interne (Catalogue | Boutique interne, http://localhost:3000/). Ce plan couvre les fonctionnalités du panier d'achat : ajout de produits, retrait de produits, calcul du total et mise à jour du badge compteur dans la barre de navigation.

Catalogue observé (page d'accueil) :
- Clavier mécanique — Périphériques — 49,00 € — bouton "Ajouter au panier" disponible
- Souris ergonomique — Périphériques — 29,00 € — bouton "Ajouter au panier" disponible
- Écran 27 pouces — Affichage — 289,00 € — bouton "Ajouter au panier" disponible
- Casque antibruit — Audio — 159,00 € — bouton "Indisponible" (désactivé, produit non ajoutable)
- Station d'accueil — Périphériques — 189,00 € — bouton "Ajouter au panier" disponible
- Webcam HD — Audio — 79,00 € — bouton "Ajouter au panier" disponible
- Support d'écran — Affichage — 39,00 € — bouton "Ajouter au panier" disponible
- Tapis de souris XL — Périphériques — 19,00 € — bouton "Ajouter au panier" disponible

Comportements observés utiles pour l'ensemble des scénarios :
- Le badge du panier est le lien "Panier" dans la barre de navigation ; son texte est la concaténation du mot "Panier" et du nombre total d'unités (ex. "Panier0", "Panier1", "Panier3"), sans espace ni séparateur visible dans l'arbre d'accessibilité.
- Le badge compte la SOMME DES QUANTITÉS de tous les articles du panier (et non le nombre de lignes/produits distincts).
- Ajouter un produit déjà présent dans le panier n'ajoute pas de nouvelle ligne : la quantité de la ligne existante est incrémentée et le montant de la ligne est recalculé (prix unitaire × quantité).
- Après un ajout depuis le catalogue, un message de confirmation "Article ajouté au panier" apparaît sur la page catalogue (zone de statut).
- La page /panier affiche un tableau avec les colonnes "Article", "Quantité", "Montant" et une colonne d'actions (bouton "Retirer" par ligne), suivi d'un titre "Total : X,XX €" et d'un bouton "Commander".
- Le bouton "Retirer" supprime la ligne ENTIÈRE du panier en un seul clic, quelle que soit la quantité (il ne décrémente pas d'une unité). Il n'existe aucun contrôle +/- pour ajuster la quantité directement depuis le panier.
- Quand le panier est vide, la page /panier affiche uniquement le titre "Votre panier" et le paragraphe "Votre panier est vide." ; il n'y a alors ni tableau, ni total, ni bouton "Commander".
- Chaque test part d'un état initial vierge (le seed navigue simplement vers "/" dans un contexte de navigateur frais, donc le panier est vide au démarrage de chaque scénario).

## Test Scenarios

### 1. Panier

**Seed:** `tests/seed.spec.ts`

#### 1.1. Ajout d'un produit unique au panier

**File:** `tests/panier/ajout-produit-unique.spec.ts`

**Steps:**
  1. Depuis la page catalogue (/), vérifier l'état initial du badge panier dans la barre de navigation.
    - expect: Le lien de navigation affiche "Panier0"
  2. Cliquer sur le bouton "Ajouter au panier" du produit "Clavier mécanique" (49,00 €).
    - expect: Un message de statut "Article ajouté au panier" s'affiche sur la page catalogue
    - expect: Le badge panier passe de "Panier0" à "Panier1"
  3. Cliquer sur le lien "Panier" dans la barre de navigation.
    - expect: L'URL devient /panier
    - expect: Le titre "Votre panier" est affiché
    - expect: Le tableau contient une seule ligne : Article "Clavier mécanique", Quantité "1", Montant "49,00 €", avec un bouton "Retirer"
    - expect: Le titre "Total : 49,00 €" est affiché
    - expect: Le bouton "Commander" est présent

#### 1.2. Ajout de plusieurs produits différents

**File:** `tests/panier/ajout-plusieurs-produits.spec.ts`

**Steps:**
  1. Depuis le catalogue, cliquer sur "Ajouter au panier" du produit "Clavier mécanique" (49,00 €).
    - expect: Le badge panier affiche "Panier1"
  2. Cliquer sur "Ajouter au panier" du produit "Souris ergonomique" (29,00 €).
    - expect: Le badge panier affiche "Panier2"
  3. Aller sur la page /panier (via le lien "Panier").
    - expect: Le tableau contient deux lignes distinctes : "Clavier mécanique" (Quantité 1, Montant 49,00 €) et "Souris ergonomique" (Quantité 1, Montant 29,00 €)
    - expect: Le titre affiché est "Total : 78,00 €" (49,00 € + 29,00 €)

#### 1.3. Ajout du même produit plusieurs fois (incrémentation de quantité)

**File:** `tests/panier/ajout-meme-produit.spec.ts`

**Steps:**
  1. Depuis le catalogue, cliquer deux fois de suite sur le bouton "Ajouter au panier" du produit "Clavier mécanique" (49,00 €).
    - expect: Après le premier clic, le badge affiche "Panier1"
    - expect: Après le second clic, le badge affiche "Panier2" (pas de doublon créé pour le même produit)
  2. Aller sur la page /panier.
    - expect: Le tableau contient UNE SEULE ligne pour "Clavier mécanique"
    - expect: La cellule Quantité affiche "2"
    - expect: La cellule Montant affiche "98,00 €" (49,00 € × 2)
    - expect: Le titre affiché est "Total : 98,00 €"

#### 1.4. Impossibilité d'ajouter un produit indisponible

**File:** `tests/panier/ajout-produit-indisponible.spec.ts`

**Steps:**
  1. Depuis le catalogue, localiser le produit "Casque antibruit" (159,00 €, catégorie Audio).
    - expect: Le bouton associé affiche le libellé "Indisponible" et est désactivé (non cliquable)
  2. Vérifier que le badge panier reste inchangé et que l'ajout de ce produit n'est pas possible.
    - expect: Le badge panier affiche toujours "Panier0"
  3. Aller sur la page /panier.
    - expect: Le message "Votre panier est vide." est affiché : le produit indisponible n'a pas pu être ajouté

#### 1.5. Retrait d'un produit du panier (ligne à quantité 1)

**File:** `tests/panier/retrait-produit.spec.ts`

**Steps:**
  1. Depuis le catalogue, ajouter "Clavier mécanique" (49,00 €) puis "Souris ergonomique" (29,00 €) au panier.
    - expect: Le badge panier affiche "Panier2"
  2. Aller sur la page /panier.
    - expect: Le tableau affiche deux lignes et le titre "Total : 78,00 €"
  3. Cliquer sur le bouton "Retirer" de la ligne "Souris ergonomique".
    - expect: La ligne "Souris ergonomique" disparaît du tableau
    - expect: Il ne reste que la ligne "Clavier mécanique" (Quantité 1, Montant 49,00 €)
    - expect: Le titre passe à "Total : 49,00 €"
    - expect: Le badge panier passe à "Panier1"

#### 1.6. Retrait d'une ligne dont la quantité est supérieure à 1 (retrait du dernier produit)

**File:** `tests/panier/retrait-quantite-multiple.spec.ts`

**Steps:**
  1. Depuis le catalogue, cliquer deux fois sur "Ajouter au panier" du produit "Clavier mécanique" (49,00 €).
    - expect: Le badge panier affiche "Panier2"
  2. Aller sur la page /panier.
    - expect: Le tableau affiche une ligne "Clavier mécanique", Quantité "2", Montant "98,00 €"
  3. Cliquer sur le bouton "Retirer" de cette ligne.
    - expect: La ligne entière est supprimée en un seul clic, bien que la quantité soit de 2 (le bouton "Retirer" ne décrémente pas d'une unité, il retire tout le produit)
    - expect: Comme il s'agissait du dernier produit du panier, la page affiche désormais le message "Votre panier est vide."
    - expect: Le tableau, le titre "Total" et le bouton "Commander" ne sont plus affichés
    - expect: Le badge panier repasse à "Panier0"

#### 1.7. Calcul du total pour un produit unique à prix élevé

**File:** `tests/panier/calcul-total-produit-unique.spec.ts`

**Steps:**
  1. Depuis le catalogue, cliquer sur "Ajouter au panier" du produit "Écran 27 pouces" (289,00 €).
    - expect: Le badge panier affiche "Panier1"
  2. Aller sur la page /panier.
    - expect: La ligne "Écran 27 pouces" affiche Quantité "1" et Montant "289,00 €"
    - expect: Le titre affiché est "Total : 289,00 €" (identique au montant de la ligne unique)

#### 1.8. Calcul du total avec plusieurs produits et quantités variées

**File:** `tests/panier/calcul-total-multi-produits.spec.ts`

**Steps:**
  1. Depuis le catalogue, cliquer deux fois sur "Ajouter au panier" du produit "Clavier mécanique" (49,00 €).
    - expect: Le badge panier affiche "Panier2"
  2. Cliquer une fois sur "Ajouter au panier" du produit "Webcam HD" (79,00 €).
    - expect: Le badge panier affiche "Panier3"
  3. Cliquer une fois sur "Ajouter au panier" du produit "Support d'écran" (39,00 €).
    - expect: Le badge panier affiche "Panier4"
  4. Aller sur la page /panier.
    - expect: Trois lignes sont affichées : "Clavier mécanique" (Quantité 2, Montant 98,00 €), "Webcam HD" (Quantité 1, Montant 79,00 €), "Support d'écran" (Quantité 1, Montant 39,00 €)
    - expect: Le titre affiché est "Total : 216,00 €" (98,00 € + 79,00 € + 39,00 €)

#### 1.9. Mise à jour du badge du panier après une séquence d'ajouts et de retraits

**File:** `tests/panier/badge-mise-a-jour.spec.ts`

**Steps:**
  1. Depuis le catalogue, vérifier l'état initial du badge.
    - expect: Le badge panier affiche "Panier0"
  2. Cliquer sur "Ajouter au panier" du produit "Tapis de souris XL" (19,00 €).
    - expect: Le badge panier passe immédiatement à "Panier1", sans qu'il soit nécessaire de recharger la page
  3. Cliquer sur "Ajouter au panier" du produit "Station d'accueil" (189,00 €).
    - expect: Le badge panier passe à "Panier2"
  4. Cliquer une seconde fois sur "Ajouter au panier" du produit "Tapis de souris XL".
    - expect: Le badge panier passe à "Panier3" (2 unités de Tapis de souris XL + 1 unité de Station d'accueil)
  5. Aller sur /panier puis cliquer sur "Retirer" pour la ligne "Station d'accueil".
    - expect: Le badge panier passe à "Panier2"
  6. Cliquer sur "Retirer" pour la ligne "Tapis de souris XL" (Quantité 2).
    - expect: Le badge panier passe à "Panier0"
    - expect: Le message "Votre panier est vide." s'affiche

#### 1.10. Affichage du panier vide (état initial, sans aucun ajout)

**File:** `tests/panier/panier-vide-etat-initial.spec.ts`

**Steps:**
  1. Depuis une session fraîche (page catalogue chargée par le seed), sans cliquer sur aucun bouton "Ajouter au panier", cliquer directement sur le lien "Panier" dans la barre de navigation.
    - expect: L'URL devient /panier
    - expect: Le badge panier affiche "Panier0"
    - expect: Le titre "Votre panier" est affiché
    - expect: Le paragraphe "Votre panier est vide." est affiché
    - expect: Aucun tableau, aucun titre "Total" et aucun bouton "Commander" ne sont présents sur la page
