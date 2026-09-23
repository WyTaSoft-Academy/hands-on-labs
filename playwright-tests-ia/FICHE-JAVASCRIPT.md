# Fiche de secours — le JavaScript dont vous avez besoin

À garder ouverte pendant les TP. Elle ne couvre pas le langage : seulement ce
qu'on rencontre dans un test Playwright, et les erreurs qui font perdre du temps.

---

## Ce qu'on lit en haut d'un fichier

```ts
import { test, expect } from '@playwright/test';
```

On importe deux choses depuis un paquet. Les accolades veulent dire « prends
ces éléments-là ». Sans accolades, on prendrait l'export principal.

---

## Variables

```ts
const prix = 49;              // ne changera pas de valeur
let compteur = 0;             // pourra changer
compteur = compteur + 1;
```

Utilisez `const` par défaut. `let` seulement si la valeur doit changer.
`const` sur un objet ou un tableau empêche de le **remplacer**, pas de le modifier.

---

## Chaînes de caractères

```ts
const nom = 'Clavier mécanique';
const message = `Le produit ${nom} coûte ${prix} €`;   // gabarit, entre accents graves
```

Les accents graves (`` ` ``) permettent d'insérer une valeur avec `${...}`.
Les apostrophes simples ne le permettent pas.

---

## Tableaux

```ts
const produits = ['Clavier', 'Souris', 'Écran'];

produits.length            // 3
produits[0]                // 'Clavier'   — on compte à partir de 0
produits.includes('Souris')  // true

for (const p of produits) {
  console.log(p);
}
```

---

## Objets

```ts
const produit = { id: 1, nom: 'Clavier mécanique', prix: 49 };

produit.nom                // 'Clavier mécanique'
produit['nom']             // la même chose
```

Un objet sert aussi à passer des **options nommées**, ce que Playwright fait
partout :

```ts
page.getByRole('button', { name: 'Ajouter au panier' });
//              ^ 1er argument      ^ 2e argument : un objet d'options
```

---

## Fonctions

```ts
function additionner(a, b) {
  return a + b;
}

const additionner = (a, b) => a + b;        // fonction fléchée, forme courte

const direBonjour = () => {                  // sans argument, avec un corps
  console.log('bonjour');
};
```

La forme fléchée `() => { ... }` est celle qu'on voit dans tous les tests.

---

## Déstructuration

```ts
const { nom, prix } = produit;      // extrait deux propriétés d'un objet
```

C'est ce que fait Playwright dans la signature d'un test :

```ts
test('mon test', async ({ page }) => { ... });
//                       ^ « donne-moi la propriété page de l'objet fourni »
```

---

## `async` et `await` — le point le plus important

Une action de navigateur prend du temps. Ces fonctions renvoient donc une
**promesse** : un accusé de réception, pas encore le résultat.

```ts
await page.goto('/');                    // attend que ce soit fait
await page.getByRole('button').click();  // puis passe à la suite
```

- `await` : « attends le résultat avant de continuer ».
- `async` : obligatoire sur toute fonction qui contient un `await`. Les tests
  Playwright sont déjà déclarés `async`, vous n'avez rien à faire.

```ts
test('exemple', async ({ page }) => {    // ← async est déjà là
  await page.goto('/');
});
```

**Où `await` est nécessaire**

| Cas | `await` ? |
|---|---|
| Une action : `click`, `fill`, `goto`, `press` | oui |
| Une assertion sur la page : `expect(locator).toBeVisible()` | oui |
| Une lecture : `textContent()`, `count()` | oui |
| Une assertion sur une valeur déjà calculée : `expect(total).toBe(3)` | non |

---

## Les trois erreurs qui coûtent le plus de temps

### 1. Le `await` oublié

```ts
page.getByRole('button').click();   // ✗ part sans qu'on l'attende
```

Symptôme : le test passe alors qu'il ne devrait pas, ou se termine
anormalement vite. Un avertissement `promise was not awaited` peut apparaître.

### 2. La parenthèse ou l'accolade non fermée

```ts
await expect(page.getByRole('heading').toHaveText('Panier');
//           ^ il manque une parenthèse fermante avant .toHaveText
```

Le message parle souvent d'une ligne **après** l'erreur réelle. Remontez.

### 3. La virgule oubliée entre deux options

```ts
page.getByRole('button' { name: 'Ajouter' });   // ✗ virgule manquante
page.getByRole('button', { name: 'Ajouter' });  // ✓
```

---

## Lire un message d'erreur

```
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('badge-panier')
Expected: "1"
Received: "0"
Timeout:  5000ms

Call log:
  - waiting for getByTestId('badge-panier')
    2 × locator resolved to <span …>0</span>
      - unexpected value "0"
```

Lisez dans cet ordre :

1. **Expected / Received** — ce qui était attendu, ce qui a été trouvé.
2. **`locator resolved to`** — si cette ligne est là, l'élément **a été trouvé** :
   le problème est la valeur. Si elle est absente, c'est le **sélecteur**.
3. **Le numéro de ligne** en bas, avec le `>` qui pointe la ligne fautive.

---

## Les mots qu'on croise sans les avoir appris

| Mot | Ce que ça veut dire ici |
|---|---|
| `const` / `let` | déclarer une valeur, modifiable ou non |
| `=>` | une fonction, forme courte |
| `async` / `await` | code qui prend du temps, et attente du résultat |
| `{ }` | un objet, ou un bloc de code selon la position |
| `?.` | « si ça existe » : `resultat?.nom` ne plante pas si `resultat` est absent |
| `!` (après une valeur) | « je garantis que ce n'est pas vide », en TypeScript |
| `...` | étale un objet ou un tableau : `{ ...devices['Desktop Chrome'] }` |
| `//` | un commentaire, ignoré à l'exécution |

---

## Si vous êtes bloqué

1. Relisez le message d'erreur en entier, sans le tronquer.
2. Ouvrez la trace : `npx playwright show-trace test-results/…/trace.zip`
3. Dans le mode UI, utilisez **Pick locator** pour obtenir le bon sélecteur.
4. Demandez. Au-delà de dix minutes, vous n'apprenez plus.
