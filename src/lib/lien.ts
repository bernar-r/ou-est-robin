const RACINE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/**
 * Le site est publié dans un sous-dossier sur GitHub Pages
 * (bernar-r.github.io/ou-est-robin/) : tous les liens internes doivent passer par ici.
 */
export function lien(chemin = '/'): string {
  const suite = chemin.replace(/^\/+/, '');
  return suite ? `${RACINE}/${suite}` : `${RACINE}/`;
}
