# TP 4a — Traiter une image avec NumPy

**Durée :** ≈ 50 min, dont 5 de restitution · **Module 4, matin** · individuel

Une image couleur est un tableau à trois dimensions. Tout ce TP se fait **sans boucle** :
chaque opération porte sur le tableau entier. Aucune donnée à copier : l'image
(`grace_hopper.jpg`) est livrée avec Matplotlib.

Fichiers : `depart-4a.ipynb` (à compléter), `corrige-4a.ipynb` (projeté en restitution).

## Étapes

1. **Charger et inspecter.** `plt.imread` : forme, `dtype`, valeurs extrêmes de chaque canal.
2. **Niveaux de gris.** Produit matriciel par `[0.299, 0.587, 0.114]`. Affichez avec
   `cmap="gray"`, puis sans : les fausses couleurs ne sont pas une erreur de calcul.
3. **Recadrer, retourner, réduire.** Avec des tranches seulement : le visage, un miroir,
   une image deux fois plus petite.
4. **Négatif et seuillage.** `255 - img` ; la proportion de pixels gris au-dessus de 128.
5. **Une planche de cinq vignettes.** `plt.subplots(1, 5)`, un titre chacune, `savefig("planche.png")`.

> Vérification : `(600, 512, 3)`, `uint8`, de 0 à 255 ; le gris a la forme `(600, 512)` ;
> le visage et la casquette tiennent dans `img[60:330, 130:380]` (la slide recadre plus serré, `[110:320, 130:380]`) ; **28,5 %** des pixels gris dépassent 128.

## Les deux pièges

- **Le `uint8` qui déborde** : `206 + 80` donne `30`, sans erreur. Passer en `float`
  (`astype(float)`) avant de calculer, et revenir en `uint8` après un `np.clip`.
- **La tranche qui modifie l'original** : une tranche est une *vue*, pas une copie. Ici,
  `plt.imread` rend l'image **en lecture seule** : `img[:100] = 0` lève
  `ValueError: assignment destination is read-only`. Travaillez sur `im = img.copy()` :
  `haut = im[:100]` puis `haut[:] = 0` noircit alors `im` lui-même.

## Bonus

Histogramme des niveaux de gris (`ax.hist(gris.ravel(), bins=64)`) ; éclaircir de 30 % sans
déborder : `np.clip(img.astype(float) * 1.3, 0, 255).astype(np.uint8)`.
