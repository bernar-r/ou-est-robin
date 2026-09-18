# Carte de suivi famille — Voyage Thaïlande & Laos 2026

Mini-site statique qui répond à une seule question, pour les proches de Robin :
**où en est-il aujourd’hui, et est-ce que tout va bien ?**

- `/` — « En ce moment » : ville du jour, heure locale, avancement, carte, dernière nouvelle.
- `/voyage` — les 25 journées, racontées simplement.
- `/rassurer` — assurance, santé, comment le joindre, qui appeler.

L’étape du jour est **calculée automatiquement** à partir de la date réelle, en heure d’Asie
(`Asia/Bangkok`). Aucune action quotidienne n’est nécessaire : la page avance toute seule.

---

## ⚠️ Contrainte importante : ne pas installer sur le disque G:

Le projet est stocké dans Google Drive (`G:`), qui **ne supporte pas** l’écriture de `node_modules`
(npm échoue avec des erreurs `TAR_ENTRY_ERROR`).

Deux façons de travailler :

1. **Recommandé** — pousser ce dossier sur un dépôt Git, le cloner sur le disque `C:`, et y
   développer. Le déploiement se fait ensuite tout seul à chaque `git push`.
2. **Dépannage** — copier le dossier dans un répertoire local (`C:\dev\carte-famille` par exemple),
   y lancer `npm install`, puis recopier uniquement `src/` et `public/` vers le Drive.

---

## Installer et lancer

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # vérification TypeScript + génération de dist/
npm run preview   # prévisualiser le site construit
```

Node 20.3+ requis (testé avec Node 22).

---

## Mettre à jour pendant le voyage

Un seul fichier à toucher : [`src/data/statut.json`](src/data/statut.json).

```json
{
  "derniereNouvelleISO": "2026-10-12T21:30:00+07:00",
  "messageDeRobin": "Grotte de Kong Lor traversée, c'était énorme. Tout va bien.",
  "villeReelle": null,
  "toutVaBien": true,
  "prochainContactPrevu": "Demain soir depuis Thakhek."
}
```

| Champ | À quoi ça sert |
| :--- | :--- |
| `derniereNouvelleISO` | Date et heure du message, avec le décalage (`+07:00` au Laos et en Thaïlande). Au-delà de 3 jours de silence, un encart rassurant s’affiche automatiquement. |
| `messageDeRobin` | Le mot affiché en grand sur la page d’accueil. |
| `villeReelle` | `null` en temps normal. À remplir (ex. `"Nong Khiaw"`) seulement si le programme a changé. |
| `toutVaBien` | `true` / `false`. |
| `prochainContactPrevu` | Phrase libre, pour rassurer sur le prochain signe de vie. |

Depuis un téléphone : ouvrir le fichier sur GitHub, bouton crayon, modifier, « Commit changes ».
Le site se reconstruit et se met en ligne tout seul en une minute environ.

Pour modifier une étape, un texte ou une photo : [`src/data/itineraire.ts`](src/data/itineraire.ts).
Les dates et les coordonnées sont validées par Zod **au build** — une erreur fait échouer la mise en
ligne plutôt que d’afficher une page fausse.

---

## Déployer

Le site est publié sur **GitHub Pages**, dépôt `bernar-r/ou-est-robin`, à l'adresse :

> **https://bernar-r.github.io/ou-est-robin/**

Le dépôt du gîte (`bernar-r/site-latuffiere`, domaine `latuffiere.pro`) n'est pas concerné : ce sont
deux projets GitHub Pages distincts.

### Mise en place, une seule fois

```bash
git init -b main
git add .
git commit -m "Site de suivi du voyage pour la famille"
git remote add origin https://github.com/bernar-r/ou-est-robin.git
git push -u origin main
```

Puis sur GitHub : **Settings ▸ Pages ▸ Source = GitHub Actions**. Le workflow
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) construit et publie à chaque `git push`,
et une fois par nuit pour que le HTML servi reste à la bonne date.

### Points spécifiques à GitHub Pages

| Sujet | Détail |
| :--- | :--- |
| Chemin de base | `base: '/ou-est-robin'` dans la config. Tous les liens internes passent par [`src/lib/lien.ts`](src/lib/lien.ts) — ne jamais écrire `href="/voyage"` en dur. |
| En-têtes HTTP | GitHub Pages **ignore** `public/_headers`. La politique de sécurité est donc posée en balise `<meta http-equiv="Content-Security-Policy">` dans [`src/layouts/Base.astro`](src/layouts/Base.astro). Le fichier `_headers` est conservé pour un éventuel passage à Cloudflare ou Netlify. |
| `robots.txt` | Sans effet sur un projet en sous-dossier (les robots ne lisent que celui du domaine racine). C'est la balise `noindex` présente sur les trois pages qui empêche le référencement. |
| `.nojekyll` | Indispensable : sans lui, GitHub ignorerait le dossier `_astro/` (les dossiers commençant par `_` sont filtrés par Jekyll). |
| Dépôt public | GitHub Pages en offre gratuite impose un dépôt public : l'itinéraire est donc consultable sur github.com. Aucune donnée d'identité ni adresse n'y figure (voir ci-dessous). Pour un dépôt privé, il faut passer à Cloudflare Pages — la config [`netlify.toml`](netlify.toml) et `_headers` sont déjà prêts. |

---

## Règles de confidentialité (le site est public par lien)

Ne jamais faire apparaître dans ce projet :

- numéro de passeport, de permis, référence eVisa, numéro de contrat d’assurance, groupe sanguin,
  date de naissance, adresse du domicile ;
- références de réservation (Agoda, compagnies aériennes, train SRT) ;
- numéros de téléphone privés, noms, adresses ou téléphones exacts des hébergements ;
- position GPS précise ou en temps réel — seules les **villes d’étape** sont affichées.

Aucun cookie, aucun tracker, aucune statistique.

---

## Structure

```text
carte-famille/
├── src/
│   ├── data/
│   │   ├── itineraire.ts   <- les 25 journées (source : 01_ROADBOOK_JOUR_PAR_JOUR.md)
│   │   ├── traces.ts       <- tracés GeoJSON (vols, trains, moto, barque, marche)
│   │   ├── schema.ts       <- types + validation Zod
│   │   ├── statut.json     <- LE fichier à mettre à jour pendant le voyage
│   │   └── statut.ts
│   ├── lib/voyage.ts       <- calcul du jour courant, heure locale, décalage
│   ├── components/         <- En-tête, En ce moment, Carte, Dernière nouvelle…
│   ├── layouts/Base.astro
│   ├── pages/              <- index, voyage, rassurer
│   ├── scripts/            <- carte-init.ts (MapLibre, chargé à la demande), maintenant.ts
│   └── styles/global.css   <- thème Tailwind 4
├── public/                 <- icônes PWA, manifest, robots.txt, _headers
└── netlify.toml
```

---

## Choix techniques

- **Astro 5** en sortie statique : pas de serveur, pas de base de données, hébergement gratuit.
- **MapLibre GL JS** chargé en différé (`IntersectionObserver` + `import()`) : la bibliothèque n’est
  téléchargée que si la carte entre à l’écran. Repli automatique vers la liste des étapes si le
  WebGL ou le réseau fait défaut.
- **Fond de carte OpenFreeMap**, sans compte ni clé d’API.
- **Polices système** plutôt que Google Fonts : plus rapide, et aucune requête vers un tiers.
- **Accessibilité** : texte à 18 px par défaut, bouton « AA » pour agrandir, contrastes AA, cibles
  tactiles de 48 px, `prefers-reduced-motion` respecté.

L’ancienne carte immersive `../carte-itineraire.html` reste utilisable telle quelle : elle vise
l’usage personnel de Robin (mode pilote, dénivelés, références logistiques) et n’est pas destinée à
être partagée.
