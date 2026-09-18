import type { Transport } from './schema';

type Coord = [number, number];

export interface ProprietesTrace {
  /** Jour d'itinéraire auquel ce tronçon est parcouru (sert à colorer le passé et le futur). */
  jour: number;
  transport: Transport;
  libelle: string;
}

export type TraceFeature = GeoJSON.Feature<GeoJSON.LineString, ProprietesTrace>;

/** Courbe de Bézier quadratique : donne aux vols long-courriers une allure d'arc. */
function arcAerien(depart: Coord, arrivee: Coord, courbure = 0.18, points = 64): Coord[] {
  const [lng1, lat1] = depart;
  const [lng2, lat2] = arrivee;
  const milieuLng = (lng1 + lng2) / 2;
  const milieuLat = (lat1 + lat2) / 2 + Math.abs(lng1 - lng2) * courbure;

  return Array.from({ length: points + 1 }, (_, i): Coord => {
    const t = i / points;
    const u = 1 - t;
    return [
      u * u * lng1 + 2 * u * t * milieuLng + t * t * lng2,
      u * u * lat1 + 2 * u * t * milieuLat + t * t * lat2,
    ];
  });
}

const GENEVE: Coord = [6.1432, 46.2044];
const BANGKOK: Coord = [100.7501, 13.69];
const CHIANG_MAI: Coord = [98.9625, 18.7677];

const troncons: Array<ProprietesTrace & { coordonnees: Coord[] }> = [
  {
    jour: 0,
    transport: 'avion',
    libelle: 'Vol Genève ➔ Bangkok',
    coordonnees: arcAerien(GENEVE, BANGKOK, 0.18),
  },
  {
    jour: 3,
    transport: 'train',
    libelle: 'Train de nuit Bangkok ➔ frontière du Laos',
    coordonnees: [
      [100.5404, 13.804],
      [100.6132, 14.354],
      [100.9177, 14.5039],
      [101.1567, 14.639],
      [102.1, 14.97],
      [102.8333, 16.4333],
      [102.742, 17.8783],
    ],
  },
  {
    jour: 4,
    transport: 'bus',
    libelle: 'Bus frontière ➔ Vientiane ➔ Thakhek',
    coordonnees: [
      [102.742, 17.8783],
      [102.61, 17.965],
      [103.6, 17.7],
      [104.4, 17.5],
      [104.8306, 17.4042],
    ],
  },
  {
    jour: 5,
    transport: 'moto',
    libelle: 'Boucle de Thakhek à moto',
    coordonnees: [
      [104.8306, 17.4042],
      [105.0, 17.45],
      [105.0298, 17.7816],
      [105.18, 18.18],
      [104.7475, 17.9589],
      [104.6, 17.8],
      [104.8306, 17.4042],
    ],
  },
  {
    jour: 7,
    transport: 'bateau',
    libelle: 'Traversée souterraine de Kong Lor en barque',
    coordonnees: [
      [104.7475, 17.9589],
      [104.77, 17.965],
      [104.805, 17.972],
    ],
  },
  {
    jour: 9,
    transport: 'bus',
    libelle: 'Bus Thakhek ➔ Vientiane',
    coordonnees: [
      [104.8306, 17.4042],
      [104.4, 17.5],
      [103.6, 17.7],
      [102.61, 17.965],
    ],
  },
  {
    jour: 10,
    transport: 'train',
    libelle: 'Train rapide Vientiane ➔ Luang Prabang ➔ nord du Laos',
    coordonnees: [
      [102.6667, 18.0667],
      [102.4333, 18.9167],
      [102.1396, 19.8893],
      [101.765, 21.05],
    ],
  },
  {
    jour: 13,
    transport: 'moto',
    libelle: 'Route de montagne Luang Prabang ➔ Nong Khiaw',
    coordonnees: [
      [102.1396, 19.8893],
      [102.3, 20.2],
      [102.5, 20.45],
      [102.6108, 20.5714],
    ],
  },
  {
    jour: 15,
    transport: 'bateau',
    libelle: 'Barque sur la rivière Nam Ou',
    coordonnees: [
      [102.6108, 20.5714],
      [102.66, 20.64],
      [102.715, 20.735],
    ],
  },
  {
    jour: 17,
    transport: 'train',
    libelle: 'Train et minibus ➔ Luang Namtha',
    coordonnees: [
      [102.1396, 19.8893],
      [101.765, 21.05],
      [101.4058, 20.9616],
    ],
  },
  {
    jour: 18,
    transport: 'marche',
    libelle: 'Trek de deux jours dans la forêt de Nam Ha',
    coordonnees: [
      [101.4058, 20.9616],
      [101.35, 20.9],
      [101.32, 20.87],
      [101.4058, 20.9616],
    ],
  },
  {
    jour: 20,
    transport: 'bus',
    libelle: 'Passage de la frontière ➔ Chiang Rai',
    coordonnees: [
      [101.4058, 20.9616],
      [100.435, 20.285],
      [100.1, 20.1],
      [99.8325, 19.9072],
    ],
  },
  {
    jour: 21,
    transport: 'bus',
    libelle: 'Bus Chiang Rai ➔ Chiang Mai',
    coordonnees: [
      [99.8325, 19.9072],
      [99.4, 19.4],
      [98.9853, 18.7883],
    ],
  },
  {
    jour: 22,
    transport: 'moto',
    libelle: 'Montée à moto au Doi Inthanon',
    coordonnees: [
      [98.9853, 18.7883],
      [98.88, 18.6],
      [98.68, 18.52],
      [98.487, 18.5888],
    ],
  },
  {
    jour: 24,
    transport: 'avion',
    libelle: 'Vol Chiang Mai ➔ Genève',
    coordonnees: arcAerien(CHIANG_MAI, GENEVE, -0.18),
  },
];

export const TRACES: GeoJSON.FeatureCollection<GeoJSON.LineString, ProprietesTrace> = {
  type: 'FeatureCollection',
  features: troncons.map(
    ({ coordonnees, ...proprietes }): TraceFeature => ({
      type: 'Feature',
      properties: proprietes,
      geometry: { type: 'LineString', coordinates: coordonnees },
    }),
  ),
};
