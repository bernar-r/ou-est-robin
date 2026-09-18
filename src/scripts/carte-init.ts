import maplibregl, { Map as CarteMapLibre, type LngLatBoundsLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { ITINERAIRE } from '../data/itineraire';
import { TRACES } from '../data/traces';
import { TRANSPORTS } from '../data/schema';
import { dateCourteEnFrancais, situationAu } from '../lib/voyage';
import { lien } from '../lib/lien';

/** Fond de carte vectoriel libre, sans compte ni clé d'API. */
const STYLE_CARTE = 'https://tiles.openfreemap.org/styles/liberty';

const COULEUR_PASSE = '#b45309';
const COULEUR_FUTUR = '#78716c';

function cadrage(): LngLatBoundsLike {
  // Les journées de vol (escale à Doha) sortiraient le cadrage hors d'Asie du Sud-Est.
  const etapesAuSol = ITINERAIRE.filter((j) => j.pays !== 'En vol');
  const lngs = etapesAuSol.map((j) => j.coordonnees[0]);
  const lats = etapesAuSol.map((j) => j.coordonnees[1]);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

function contenuInfobulle(indexJour: number): HTMLElement {
  const jour = ITINERAIRE[indexJour]!;
  const bloc = document.createElement('div');
  bloc.style.maxWidth = '15rem';

  const date = document.createElement('p');
  date.style.cssText = 'margin:0;font-size:0.8rem;font-weight:700;color:#b45309;text-transform:uppercase;';
  date.textContent = `${dateCourteEnFrancais(jour.dateISO)} · jour ${jour.jour + 1}`;

  const titre = document.createElement('p');
  titre.style.cssText = 'margin:0.25rem 0 0;font-size:1rem;font-weight:700;color:#1c1917;';
  titre.textContent = `${jour.drapeau} ${jour.ville}`;

  const texte = document.createElement('p');
  texte.style.cssText = 'margin:0.35rem 0 0;font-size:0.9rem;color:#57534e;line-height:1.45;';
  texte.textContent = jour.tempsFort;

  bloc.append(date, titre, texte);
  return bloc;
}

export function demarrerCarte(conteneur: HTMLElement, repli: HTMLElement | null): void {
  const situation = situationAu();
  const indexAtteint = situation.etat === 'avant' ? -1 : situation.etat === 'apres' ? ITINERAIRE.length : situation.index;

  let carte: CarteMapLibre;
  try {
    carte = new maplibregl.Map({
      container: conteneur,
      style: STYLE_CARTE,
      bounds: cadrage(),
      fitBoundsOptions: { padding: { top: 60, bottom: 60, left: 40, right: 40 } },
      attributionControl: { compact: true },
      cooperativeGestures: true,
      pitchWithRotate: false,
      dragRotate: false,
    });
  } catch {
    montrerErreur(repli);
    return;
  }

  const secours = window.setTimeout(() => montrerErreur(repli), 12_000);

  carte.on('error', () => {
    /* une tuile manquante ne doit pas casser la page */
  });

  carte.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  carte.addControl(new maplibregl.FullscreenControl(), 'top-right');

  carte.on('load', () => {
    window.clearTimeout(secours);
    repli?.remove();

    carte.addSource('traces', { type: 'geojson', data: TRACES });

    carte.addLayer({
      id: 'traces-futures',
      type: 'line',
      source: 'traces',
      filter: ['>', ['get', 'jour'], indexAtteint],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': COULEUR_FUTUR,
        'line-width': 2.5,
        'line-opacity': 0.55,
        'line-dasharray': [1.5, 2],
      },
    });

    carte.addLayer({
      id: 'traces-parcourues',
      type: 'line',
      source: 'traces',
      filter: ['<=', ['get', 'jour'], indexAtteint],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': COULEUR_PASSE,
        'line-width': 4,
        'line-opacity': 0.95,
      },
    });

    ITINERAIRE.forEach((jour, index) => {
      const estAujourdhui = situation.etat === 'pendant' && index === situation.index;
      const estPassee = index < indexAtteint;

      const pastille = document.createElement('div');
      pastille.className = 'marqueur-etape';
      if (estPassee) pastille.classList.add('est-passee');
      if (estAujourdhui) pastille.classList.add('est-aujourdhui');
      pastille.setAttribute('role', 'button');
      pastille.setAttribute('tabindex', '0');
      pastille.setAttribute(
        'aria-label',
        `${jour.ville}, ${dateCourteEnFrancais(jour.dateISO)} : ${TRANSPORTS[jour.transport].label}`,
      );

      const infobulle = new maplibregl.Popup({ offset: 16, closeButton: true, maxWidth: '260px' })
        .setDOMContent(contenuInfobulle(index));

      const marqueur = new maplibregl.Marker({ element: pastille })
        .setLngLat(jour.coordonnees)
        .setPopup(infobulle)
        .addTo(carte);

      pastille.addEventListener('keydown', (evenement) => {
        if (evenement.key === 'Enter' || evenement.key === ' ') {
          evenement.preventDefault();
          marqueur.togglePopup();
        }
      });

      if (estAujourdhui) {
        marqueur.togglePopup();
      }
    });
  });
}

function montrerErreur(repli: HTMLElement | null): void {
  if (!repli || !repli.isConnected) return;
  repli.innerHTML = '';

  const message = document.createElement('p');
  message.className = 'text-encre-douce';
  message.textContent = 'La carte ne s’affiche pas sur cet appareil.';

  const lienListe = document.createElement('a');
  lienListe.href = lien('/voyage');
  lienListe.className = 'bouton bouton-secondaire mt-3';
  lienListe.textContent = 'Voir les étapes sous forme de liste';

  repli.append(message, lienListe);
}
