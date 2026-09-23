/**
 * Boutique interne : application de démonstration pour la formation Playwright.
 *
 * Aucune dépendance : elle démarre avec « node serveur.js », rien à installer.
 *
 * Défauts pédagogiques volontaires, pilotables par variables d'environnement :
 *   DEMO_LATENCE=350     délai avant mise à jour du badge panier (auto-wait)
 *   DEMO_BANNIERE=1      bandeau de consentement au délai aléatoire (test instable)
 *   DEMO_CSV_CASSE=0     export CSV encodé en latin1 (fichier valide, contenu faux)
 *   DEMO_SEUIL=1000      montant au-delà duquel une commande demande validation
 *   PORT=3000
 */

'use strict';

const http = require('http');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const LATENCE = Number(process.env.DEMO_LATENCE ?? 350);
const BANNIERE = process.env.DEMO_BANNIERE !== '0';
const CSV_CASSE = process.env.DEMO_CSV_CASSE === '1';
const SEUIL = Number(process.env.DEMO_SEUIL || 1000);

/* La classe CSS est régénérée à chaque démarrage : un sélecteur qui s'y accroche
   casse au redémarrage suivant. C'est la démonstration du module 2. */
const HASH = 'css-' + Math.random().toString(36).slice(2, 8);

/* ------------------------------------------------------------------ données */

const PRODUITS = [
  { id: 1, nom: 'Clavier mécanique', categorie: 'Périphériques', prix: 49.0, stock: 12 },
  { id: 2, nom: 'Souris ergonomique', categorie: 'Périphériques', prix: 29.0, stock: 30 },
  { id: 3, nom: 'Écran 27 pouces', categorie: 'Affichage', prix: 289.0, stock: 4 },
  { id: 4, nom: 'Casque antibruit', categorie: 'Audio', prix: 159.0, stock: 0 },
  { id: 5, nom: 'Station d\'accueil', categorie: 'Périphériques', prix: 189.0, stock: 7 },
  { id: 6, nom: 'Webcam HD', categorie: 'Audio', prix: 79.0, stock: 15 },
  { id: 7, nom: 'Support d\'écran', categorie: 'Affichage', prix: 39.0, stock: 22 },
  { id: 8, nom: 'Tapis de souris XL', categorie: 'Périphériques', prix: 19.0, stock: 40 },
];

const COMPTES = {
  'client@demo.test': { mdp: 'demo', nom: 'Marie DUPONT', role: 'client' },
  'responsable@demo.test': { mdp: 'demo', nom: 'Karim BENALI', role: 'responsable' },
};

/** Sessions en mémoire. Chaque BrowserContext a ses cookies, donc son panier :
 *  l'isolation des tests fonctionne naturellement. */
const sessions = new Map();
let commandes = [];
let compteurCommande = 0;

function nouvelleSession() {
  const sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
  sessions.set(sid, { panier: [], utilisateur: null });
  return sid;
}

/* ------------------------------------------------------------------ helpers */

const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';
const echap = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

function lireCookies(req) {
  const brut = req.headers.cookie || '';
  const out = {};
  for (const part of brut.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function corpsJson(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
    });
  });
}

function corpsFormulaire(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      const out = {};
      for (const p of new URLSearchParams(data)) out[p[0]] = p[1];
      resolve(out);
    });
  });
}

function total(session) {
  return session.panier.reduce((s, l) => s + l.prix * l.qte, 0);
}

/* --------------------------------------------------------------- rendu HTML */

const STYLE = `
:root{--vert:#1f8a3c;--gris:#5b6470;--trait:#e2e5e9;--ink:#16191d}
*{box-sizing:border-box}
body{margin:0;font-family:"Segoe UI",system-ui,sans-serif;color:var(--ink);background:#f7f8f9;line-height:1.5}
header{background:#fff;border-bottom:1px solid var(--trait);padding:14px 28px;display:flex;align-items:center;gap:24px}
header a{color:var(--ink);text-decoration:none}
header .marque{font-weight:700;font-size:18px}
header nav{display:flex;gap:18px;margin-left:auto;align-items:center}
main{max-width:960px;margin:0 auto;padding:28px}
h1{font-size:28px;margin:0 0 20px}
h2{font-size:20px;margin:28px 0 12px}
ul.produits{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
ul.produits li{background:#fff;border:1px solid var(--trait);border-radius:10px;padding:16px 18px}
ul.produits h3{margin:0 0 4px;font-size:17px}
.cat{color:var(--gris);font-size:14px}
.prix{font-weight:700;margin:8px 0}
button,.bouton{font:inherit;background:var(--vert);color:#fff;border:0;border-radius:7px;padding:8px 14px;cursor:pointer}
button[disabled]{background:#c3c8ce;cursor:not-allowed}
button.secondaire{background:#fff;color:var(--ink);border:1px solid var(--trait)}
input,select{font:inherit;padding:8px 10px;border:1px solid var(--trait);border-radius:7px;width:100%}
label{display:block;font-size:14px;color:var(--gris);margin:14px 0 4px}
form.etroit{max-width:360px}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--trait);border-radius:10px;overflow:hidden}
th,td{text-align:left;padding:11px 14px;border-bottom:1px solid var(--trait)}
th{font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--gris)}
tr:last-child td{border-bottom:0}
[role=alert]{background:#fbe9e9;border:1px solid #efc9c9;color:#a12b2b;padding:12px 16px;border-radius:8px;margin:16px 0}
[role=status]{background:#e8f4ea;border:1px solid #c5e2cc;color:#16642c;padding:12px 16px;border-radius:8px;margin:16px 0}
.badge{background:var(--vert);color:#fff;border-radius:999px;padding:1px 9px;font-size:13px;margin-left:6px}
#banniere-cookies{position:fixed;inset:0;background:rgba(16,20,25,.55);display:none;
  align-items:center;justify-content:center;z-index:50}
#banniere-cookies.visible{display:flex}
#banniere-cookies .panneau{background:#1c2128;color:#fff;padding:26px 30px;border-radius:12px;
  max-width:460px;display:flex;flex-direction:column;gap:16px}
#banniere-cookies .actions{display:flex;gap:12px}
.recherche{display:flex;gap:10px;margin-bottom:22px}
.recherche input{max-width:320px}
.vide{color:var(--gris);padding:26px 0}
`;

function page(titre, contenu, session, opts = {}) {
  const nb = session.panier.reduce((s, l) => s + l.qte, 0);
  const u = session.utilisateur;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${echap(titre)} | Boutique interne</title>
<style>${STYLE}</style>
</head>
<body>
<header>
  <a class="marque" href="/">Boutique interne</a>
  <nav>
    <a href="/">Catalogue</a>
    <a href="/commandes">Commandes</a>
    ${u && u.role === 'responsable' ? '<a href="/validations">Validations</a>' : ''}
    <a href="/panier">Panier<span class="badge" data-testid="badge-panier">${nb}</span></a>
    ${u
      ? `<span data-testid="utilisateur">${echap(u.nom)}</span> <a href="/deconnexion">Se déconnecter</a>`
      : '<a href="/connexion">Se connecter</a>'}
  </nav>
</header>
<main>
${contenu}
</main>
${opts.banniere ? `
<div id="banniere-cookies" role="dialog" aria-modal="true" aria-label="Cookies">
  <div class="panneau">
    <strong>Vos preferences de confidentialite</strong>
    <span>Ce site utilise des cookies pour mesurer son audience.</span>
    <div class="actions">
      <button id="accepter-cookies">Accepter</button>
      <button class="secondaire" id="refuser-cookies">Refuser</button>
    </div>
  </div>
</div>` : ''}
<script>
const LATENCE = ${LATENCE};

async function ajouterAuPanier(id, bouton) {
  bouton.disabled = true;
  // Le message vaut pour CET ajout : on le masque avant de partir. Sinon il
  // reste affiche depuis l'ajout precedent, et « attendre la confirmation »
  // n'attend plus rien : le deuxieme ajout part sans que personne l'attende.
  const message = document.querySelector('[data-testid=confirmation]');
  if (message) { message.hidden = true; message.textContent = ''; }
  const r = await fetch('/api/panier', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  const p = await r.json();
  // Mise à jour différée : sans assertion web-first, un test naïf lit l'ancienne valeur.
  setTimeout(() => {
    document.querySelector('[data-testid=badge-panier]').textContent = p.nb;
    bouton.disabled = false;
    const s = document.querySelector('[data-testid=confirmation]');
    if (s) { s.textContent = 'Article ajouté au panier'; s.hidden = false; }
  }, LATENCE);
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-action=ajouter]');
  if (b) ajouterAuPanier(Number(b.dataset.id), b);
});

${opts.banniere ? `
// Apparition à un instant non déterministe : la cause classique d'un test instable.
const banniere = document.getElementById('banniere-cookies');
if (banniere) {
  setTimeout(() => banniere.classList.add('visible'), 60 + Math.random() * 700);
  banniere.addEventListener('click', (e) => {
    if (e.target.id === 'accepter-cookies' || e.target.id === 'refuser-cookies') {
      document.cookie = 'consent=1; path=/';
      banniere.classList.remove('visible');
    }
  });
}` : ''}
</script>
</body>
</html>`;
}

/* ---------------------------------------------------------------- les pages */

/**
 * Le catalogue est rendu par le navigateur, à partir de /api/produits.
 * C'est ce qui rend l'interception réseau du module 4 réellement observable :
 * un mock change ce qui s'affiche à l'écran.
 */
function pageCatalogue(session, q, afficheBanniere) {
  return page('Catalogue', `
<h1>Nos produits</h1>
<form class="recherche" method="get" action="/" role="search">
  <label for="q" style="position:absolute;left:-9999px">Rechercher un produit</label>
  <input id="q" name="q" type="search" placeholder="Rechercher un produit" value="${echap(q || '')}">
  <button type="submit">Rechercher</button>
</form>
<p role="status" data-testid="confirmation" hidden></p>
<div data-testid="catalogue"></div>
<script>
const CLASSE = ${JSON.stringify(HASH)};
const REQUETE = ${JSON.stringify(q || '')};

function eur(n){ return n.toFixed(2).replace('.', ',') + ' \\u20AC'; }

async function chargerCatalogue() {
  const cible = document.querySelector('[data-testid=catalogue]');
  let produits;
  try {
    const r = await fetch('/api/produits' + (REQUETE ? '?q=' + encodeURIComponent(REQUETE) : ''));
    if (!r.ok) throw new Error(r.status);
    produits = await r.json();
  } catch (e) {
    cible.innerHTML = '<p role="alert">Le catalogue est momentanément indisponible.</p>';
    return;
  }
  if (!produits.length) {
    cible.innerHTML = '<p class="vide">Aucun produit ne correspond à votre recherche.</p>';
    return;
  }
  cible.innerHTML = '<ul class="produits">' + produits.map(p => \`
    <li>
      <h3><a href="/produit?id=\${p.id}">\${p.nom}</a></h3>
      <div class="cat">\${p.categorie}</div>
      <div class="prix" data-testid="prix-\${p.id}">\${eur(p.prix)}</div>
      <button class="\${CLASSE}" data-action="ajouter" data-id="\${p.id}"
              data-testid="ajouter-\${p.id}" \${p.stock === 0 ? 'disabled' : ''}>
        \${p.stock === 0 ? 'Indisponible' : 'Ajouter au panier'}
      </button>
    </li>\`).join('') + '</ul>';
}
// Le gestionnaire de clic « ajouter au panier » est delegue au document, et il
// est declare dans le script de bas de page, donc APRES celui-ci. Rendre les
// boutons tout de suite ouvrirait une fenetre ou ils existent sans que personne
// n'ecoute : un clic y tombe dans le vide, et le panier reste vide sans erreur.
// On attend donc que tous les scripts de la page soient passes.
document.addEventListener('DOMContentLoaded', chargerCatalogue);
</script>
`, session, { banniere: afficheBanniere });
}

function pageProduit(session, id, afficheBanniere) {
  const p = PRODUITS.find((x) => x.id === id);
  if (!p) return null;
  return page(p.nom, `
<h1>${echap(p.nom)}</h1>
<p class="cat">${echap(p.categorie)}</p>
<p class="prix" data-testid="prix">${eur(p.prix)}</p>
<p data-testid="stock">${p.stock === 0 ? 'Rupture de stock' : p.stock + ' en stock'}</p>
<p role="status" data-testid="confirmation" hidden></p>
<button class="${HASH}" data-action="ajouter" data-id="${p.id}"
        data-testid="ajouter-${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
  ${p.stock === 0 ? 'Indisponible' : 'Ajouter au panier'}
</button>
<p style="margin-top:24px"><a href="/">Retour au catalogue</a></p>
`, session, { banniere: afficheBanniere });
}

function pagePanier(session) {
  const t = total(session);
  if (!session.panier.length) {
    return page('Panier', `<h1>Votre panier</h1><p class="vide">Votre panier est vide.</p>`, session);
  }
  const lignes = session.panier.map((l) => `
    <tr>
      <td>${echap(l.nom)}</td>
      <td>${l.qte}</td>
      <td>${eur(l.prix * l.qte)}</td>
      <td><form method="post" action="/panier/retirer">
        <input type="hidden" name="id" value="${l.id}">
        <button class="secondaire" type="submit">Retirer</button>
      </form></td>
    </tr>`).join('');

  return page('Panier', `
<h1>Votre panier</h1>
<table>
  <thead><tr><th>Article</th><th>Quantité</th><th>Montant</th><th></th></tr></thead>
  <tbody>${lignes}</tbody>
</table>
<h2>Total : <span data-testid="total-panier">${eur(t)}</span></h2>
${t > SEUIL ? `<p role="status">Cette commande dépassera ${eur(SEUIL)} et devra être validée par un responsable.</p>` : ''}
<form method="post" action="/commander">
  <button type="submit">Commander</button>
</form>
`, session);
}

function pageConnexion(session, erreur) {
  return page('Connexion', `
<h1>Connexion</h1>
${erreur ? `<p role="alert">${echap(erreur)}</p>` : ''}
<form class="etroit" method="post" action="/connexion">
  <label for="email">Adresse email</label>
  <input id="email" name="email" type="email" autocomplete="username">
  <label for="mdp">Mot de passe</label>
  <input id="mdp" name="mdp" type="password" autocomplete="current-password">
  <p style="margin-top:18px"><button type="submit">Se connecter</button></p>
</form>
<p class="cat">Comptes de démonstration : client@demo.test et responsable@demo.test, mot de passe « demo ».</p>
`, session);
}

function pageCommandes(session, nouvelle) {
  const u = session.utilisateur;
  if (!u) return null;
  const miennes = commandes.filter((c) => u.role === 'responsable' || c.client === u.nom);
  const exporter = '<p style="margin-top:20px"><a href="/api/export.csv">Exporter en CSV</a></p>';
  if (!miennes.length) {
    return page('Commandes',
      `<h1>Vos commandes</h1><p class="vide">Aucune commande.</p>${exporter}`, session);
  }
  const lignes = miennes.map((c) => `
    <tr data-testid="${c.reference === nouvelle ? 'commande-nouvelle' : 'commande-' + c.id}">
      <td>${c.reference}</td>
      <td>${echap(c.client)}</td>
      <td>${eur(c.montant)}</td>
      <td data-testid="statut-${c.id}">${c.statut === 'en_attente' ? 'En attente de validation' : 'Validée'}</td>
    </tr>`).join('');
  return page('Commandes', `
<h1>Vos commandes</h1>
<table>
  <thead><tr><th>Référence</th><th>Client</th><th>Montant</th><th>Statut</th></tr></thead>
  <tbody>${lignes}</tbody>
</table>
<p style="margin-top:20px"><a href="/api/export.csv">Exporter en CSV</a></p>
`, session);
}

function pageValidations(session) {
  const u = session.utilisateur;
  if (!u) return { code: 401 };
  if (u.role !== 'responsable') return { code: 403 };

  const attente = commandes.filter((c) => c.statut === 'en_attente');
  const corps = attente.length
    ? `<table>
  <thead><tr><th>Référence</th><th>Client</th><th>Montant</th><th></th></tr></thead>
  <tbody>${attente.map((c) => `
    <tr data-testid="validation-${c.id}">
      <td>${c.reference}</td>
      <td>${echap(c.client)}</td>
      <td>${eur(c.montant)}</td>
      <td><form method="post" action="/validations/valider">
        <input type="hidden" name="id" value="${c.id}">
        <button type="submit">Valider</button>
      </form></td>
    </tr>`).join('')}</tbody>
</table>`
    : '<p class="vide">Aucune demande en attente.</p>';

  return { html: page('Validations', `<h1>Demandes à valider</h1>${corps}`, session) };
}

/* -------------------------------------------------------------------- rendu */

function envoyer(res, code, type, corps, entetes = {}) {
  res.writeHead(code, {
    'Content-Type': type,
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'",
    'Referrer-Policy': 'same-origin',
    'Strict-Transport-Security': 'max-age=31536000',
    ...entetes,
  });
  res.end(corps);
}

const html = (res, corps, code = 200, e = {}) => envoyer(res, code, 'text/html; charset=utf-8', corps, e);
const json = (res, obj, code = 200) => envoyer(res, code, 'application/json; charset=utf-8', JSON.stringify(obj), { 'Cache-Control': 'no-store' });
const redirige = (res, vers, e = {}) => envoyer(res, 302, 'text/plain', '', { Location: vers, ...e });

function pageErreur(session, code, message) {
  return page(message, `<h1>${echap(message)}</h1><p role="alert">${echap(message)}</p>
<p><a href="/">Retour au catalogue</a></p>`, session);
}

/* ----------------------------------------------------------------- routeur */

const serveur = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const chemin = url.pathname;
  const cookies = lireCookies(req);

  let sid = cookies.sid;
  if (!sid || !sessions.has(sid)) {
    sid = nouvelleSession();
    res.setHeader('Set-Cookie', `sid=${sid}; Path=/; HttpOnly; SameSite=Lax`);
  }
  const session = sessions.get(sid);
  // Le bandeau ne reapparait pas une fois le consentement enregistre.
  const afficheBanniere = BANNIERE && !cookies.consent;

  try {
    /* --- API --- */

    if (chemin === '/api/sante') return json(res, { ok: true, hash: HASH, seuil: SEUIL });

    if (chemin === '/api/produits') {
      const q = url.searchParams.get('q');
      const r = q ? PRODUITS.filter((p) => p.nom.toLowerCase().includes(q.toLowerCase())) : PRODUITS;
      return json(res, r);
    }

    if (chemin === '/api/panier' && req.method === 'POST') {
      const { id } = await corpsJson(req);
      const p = PRODUITS.find((x) => x.id === Number(id));
      if (!p) return json(res, { erreur: 'Produit inconnu' }, 404);
      if (p.stock === 0) return json(res, { erreur: 'Produit indisponible' }, 409);
      const ligne = session.panier.find((l) => l.id === p.id);
      if (ligne) ligne.qte++;
      else session.panier.push({ id: p.id, nom: p.nom, prix: p.prix, qte: 1 });
      if (LATENCE) await attendre(Math.round(LATENCE / 2));
      return json(res, { nb: session.panier.reduce((s, l) => s + l.qte, 0), total: total(session) });
    }

    if (chemin === '/api/panier' && req.method === 'GET') {
      return json(res, { lignes: session.panier, total: total(session), nb: session.panier.reduce((s, l) => s + l.qte, 0) });
    }

    if (chemin === '/api/connexion' && req.method === 'POST') {
      const { email, mdp } = await corpsJson(req);
      const c = COMPTES[(email || '').toLowerCase()];
      if (!c || c.mdp !== mdp) return json(res, { erreur: 'Identifiants incorrects' }, 401);
      session.utilisateur = { nom: c.nom, role: c.role, email };
      return json(res, { nom: c.nom, role: c.role });
    }

    if (chemin === '/api/panier' && req.method === 'DELETE') {
      session.panier = [];
      return json(res, { nb: 0, total: 0 });
    }

    if (chemin === '/api/commandes' && req.method === 'GET') {
      const ref = url.searchParams.get('reference');
      if (ref) {
        const c = commandes.find((x) => x.reference === ref);
        return c ? json(res, c) : json(res, { erreur: 'Commande inconnue' }, 404);
      }
      return json(res, commandes);
    }

    if (chemin === '/api/commandes' && req.method === 'POST') {
      if (!session.utilisateur) return json(res, { erreur: 'Authentification requise' }, 401);
      const t = total(session);
      if (!session.panier.length) return json(res, { erreur: 'Commande vide' }, 422);
      const c = {
        id: ++compteurCommande,
        reference: 'CMD-' + String(compteurCommande).padStart(4, '0'),
        client: session.utilisateur.nom,
        montant: t,
        statut: t > SEUIL ? 'en_attente' : 'validee',
      };
      commandes.push(c);
      session.panier = [];
      return json(res, c, 201);
    }

    if (chemin === '/api/export.csv') {
      const lignes = ['reference;client;montant;statut']
        .concat(commandes.map((c) => `${c.reference};${c.client};${c.montant.toFixed(2)};${c.statut === 'en_attente' ? 'En attente de validation' : 'Validée'}`))
        .join('\n');
      // Encodage volontairement cassable : le fichier reste valide, les accents non.
      const corps = CSV_CASSE ? Buffer.from(lignes, 'latin1') : Buffer.from(lignes, 'utf8');
      return envoyer(res, 200, 'text/csv; charset=utf-8', corps, {
        'Content-Disposition': 'attachment; filename="commandes.csv"',
      });
    }

    if (chemin === '/api/reset' && req.method === 'POST') {
      commandes = [];
      compteurCommande = 0;
      session.panier = [];
      return json(res, { ok: true });
    }

    /* --- pages --- */

    if (chemin === '/') return html(res, pageCatalogue(session, url.searchParams.get('q'), afficheBanniere));

    if (chemin === '/produit') {
      const p = pageProduit(session, Number(url.searchParams.get('id')), afficheBanniere);
      return p ? html(res, p) : html(res, pageErreur(session, 404, 'Produit introuvable'), 404);
    }

    if (chemin === '/panier') return html(res, pagePanier(session));

    if (chemin === '/panier/retirer' && req.method === 'POST') {
      const { id } = await corpsFormulaire(req);
      session.panier = session.panier.filter((l) => l.id !== Number(id));
      return redirige(res, '/panier');
    }

    if (chemin === '/connexion' && req.method === 'GET') return html(res, pageConnexion(session, null));

    if (chemin === '/connexion' && req.method === 'POST') {
      const { email, mdp } = await corpsFormulaire(req);
      const c = COMPTES[(email || '').toLowerCase()];
      if (!c || c.mdp !== mdp) {
        return html(res, pageConnexion(session, 'Identifiants incorrects'), 401);
      }
      session.utilisateur = { nom: c.nom, role: c.role, email };
      return redirige(res, '/');
    }

    if (chemin === '/deconnexion') {
      session.utilisateur = null;
      return redirige(res, '/');
    }

    if (chemin === '/commandes') {
      const p = pageCommandes(session, url.searchParams.get('nouvelle'));
      return p ? html(res, p) : redirige(res, '/connexion');
    }

    if (chemin === '/commander' && req.method === 'POST') {
      if (!session.utilisateur) return redirige(res, '/connexion');
      const t = total(session);
      if (session.panier.length) {
        const c = {
          id: ++compteurCommande,
          reference: 'CMD-' + String(compteurCommande).padStart(4, '0'),
          client: session.utilisateur.nom,
          montant: t,
          statut: t > SEUIL ? 'en_attente' : 'validee',
        };
        commandes.push(c);
        session.panier = [];
        return redirige(res, '/commandes?nouvelle=' + encodeURIComponent(c.reference));
      }
      return redirige(res, '/commandes');
    }

    if (chemin === '/validations' && req.method === 'GET') {
      const r = pageValidations(session);
      if (r.code === 401) return redirige(res, '/connexion');
      if (r.code === 403) return html(res, pageErreur(session, 403, 'Accès refusé'), 403);
      return html(res, r.html);
    }

    if (chemin === '/validations/valider' && req.method === 'POST') {
      if (!session.utilisateur || session.utilisateur.role !== 'responsable') {
        return html(res, pageErreur(session, 403, 'Accès refusé'), 403);
      }
      const { id } = await corpsFormulaire(req);
      const c = commandes.find((x) => x.id === Number(id));
      if (c) c.statut = 'validee';
      return redirige(res, '/validations');
    }

    return html(res, pageErreur(session, 404, 'Page introuvable'), 404);
  } catch (e) {
    return html(res, pageErreur(session, 500, 'Erreur serveur'), 500);
  }
});

/**
 * Precaution, pas correctif d'un bug observe.
 *
 * Node ferme une connexion inactive au bout de 5 s (keepAliveTimeout par
 * defaut) ; Firefox garde les siennes environ 115 s et les reutilise. Il
 * existe donc une fenetre ou le navigateur ecrit une requete sur une socket
 * que le serveur est en train de fermer. C'est un piege connu, mais il n'a
 * PAS ete reproduit ici : abaisser ce reglage jusqu'a 80 ms ne fait echouer
 * aucune campagne. On aligne le serveur sur le client par hygiene.
 */
serveur.keepAliveTimeout = 120_000;
serveur.headersTimeout = 125_000;   // doit rester superieur au precedent

serveur.listen(PORT, () => {
  console.log(`Boutique interne : http://localhost:${PORT}`);
  console.log(`  latence badge panier : ${LATENCE} ms`);
  console.log(`  bandeau de consentement : ${BANNIERE ? 'actif' : 'désactivé'}`);
  console.log(`  export CSV : ${CSV_CASSE ? 'encodage cassé (latin1)' : 'correct (utf8)'}`);
  console.log(`  classe CSS générée ce démarrage : .${HASH}`);
  console.log(`  keep-alive : ${serveur.keepAliveTimeout} ms`);
});
